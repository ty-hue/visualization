import type {
  WsClientOptions,
  WsState,
  HeartbeatConfig,
  ReconnectConfig,
  MessageHandler,
  Subscription,
} from "./types"

/** 默认心跳配置 */
const DEFAULT_HEARTBEAT: Required<HeartbeatConfig> = {
  interval: 30000,
  timeout: 5000,
  pingMessage: () => JSON.stringify({ type: "ping" }),
}

/** 默认重连配置 */
const DEFAULT_RECONNECT: Required<ReconnectConfig> = {
  maxRetries: 5,
  initialDelay: 1000,
  multiplier: 2,
  maxDelay: 30000,
}

/**
 * 企业级 WebSocket 客户端
 *
 * 特性：
 * - 自动重连（指数退避）
 * - 心跳保活（ping/pong）
 * - 断线消息缓存队列
 * - 按消息类型订阅/取消订阅
 * - 连接超时处理
 */
export class WsClient {
  // ===== 实例属性 =====
  private ws: WebSocket | null = null
  private url: string
  private protocols?: string | string[]

  // 心跳
  private heartbeatConfig: Required<HeartbeatConfig>
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null

  // 重连
  private reconnectConfig: Required<ReconnectConfig>
  private retryCount = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private manualClose = false // 是否主动关闭（主动关闭不重连）

  // 连接超时
  private connectTimeout: number
  private connectTimer: ReturnType<typeof setTimeout> | null = null

  // 消息
  private subscriptions: Subscription[] = []
  private messageQueue: string[] = []
  private queueWhileClosed: boolean

  // 状态回调
  private onStateChangeCb: ((state: WsState) => void) | null = null

  constructor(options: WsClientOptions) {
    this.url = options.url
    this.protocols = options.protocols
    this.connectTimeout = options.connectTimeout ?? 10000
    this.queueWhileClosed = options.queueWhileClosed ?? true

    // 合并心跳配置
    const hb =
      options.heartbeat === false
        ? null
        : { ...DEFAULT_HEARTBEAT, ...options.heartbeat }
    this.heartbeatConfig = hb as Required<HeartbeatConfig>

    // 合并重连配置
    const rc =
      options.reconnect === false
        ? null
        : { ...DEFAULT_RECONNECT, ...options.reconnect }
    this.reconnectConfig = rc as Required<ReconnectConfig>
  }

  // ===== 公开 API =====

  /** 建立连接 */
  connect(): void {
    this.manualClose = false
    this.retryCount = 0
    this.doConnect()
  }

  /** 主动断开（不重连） */
  disconnect(): void {
    this.manualClose = true
    this.clearTimers()
    this.ws?.close()
    this.ws = null
    this.messageQueue = []
  }

  /** 发送消息 */
  send(data: string | ArrayBuffer | object): void {
    const payload = typeof data === "object" ? JSON.stringify(data) : data

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.flushQueue() // 先发送缓存消息
      this.ws.send(payload)
    } else if (this.queueWhileClosed) {
      this.messageQueue.push(payload as string)
    }
  }

  /** 订阅消息 */
  on(type: string, handler: MessageHandler): () => void {
    const sub: Subscription = { type, handler }
    this.subscriptions.push(sub)

    // 返回取消订阅函数（函数式清理）
    return () => {
      this.subscriptions = this.subscriptions.filter((s) => s !== sub)
    }
  }

  /** 注册状态变化回调 */
  onStateChange(cb: (state: WsState) => void): void {
    this.onStateChangeCb = cb
  }

  /** 获取当前连接状态 */
  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  // ===== 内部实现 =====

  private doConnect(): void {
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws.onmessage = null
    }

    try {
      this.ws = new WebSocket(this.url, this.protocols)
    } catch {
      this.handleReconnect()
      return
    }

    // 连接超时
    this.connectTimer = setTimeout(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        this.ws?.close()
      }
    }, this.connectTimeout)

    this.ws.onopen = () => {
      this.clearConnectTimer()
      this.retryCount = 0
      this.emitState(1) // OPEN
      this.startHeartbeat()
      this.flushQueue()
    }

    this.ws.onmessage = (event: MessageEvent) => {
      this.dispatchMessage(event.data)
    }

    this.ws.onclose = () => {
      this.stopHeartbeat()
      this.emitState(3) // CLOSED
      this.handleReconnect()
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  /** 消息分发：按 type 字段路由到对应订阅 */
  private dispatchMessage(raw: string): void {
    let parsed: any
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = raw
    }

    // 心跳响应不触发业务回调
    if (parsed?.type === "pong") {
      this.clearHeartbeatTimeout()
      return
    }

    const type = parsed?.type || "message"

    for (const sub of this.subscriptions) {
      if (sub.type === type || sub.type === "*") {
        sub.handler(parsed)
      }
    }
  }

  // ===== 心跳 =====

  private startHeartbeat(): void {
    if (!this.heartbeatConfig) return
    this.stopHeartbeat()

    const cfg = this.heartbeatConfig

    this.heartbeatTimer = setInterval(() => {
      const msg =
        typeof cfg.pingMessage === "function"
          ? cfg.pingMessage()
          : cfg.pingMessage
      this.ws?.send(msg)

      // 超时未收到 pong 则断连触发重连
      this.heartbeatTimeoutTimer = setTimeout(() => {
        this.ws?.close()
      }, cfg.timeout)
    }, cfg.interval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    this.clearHeartbeatTimeout()
  }

  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
  }

  // ===== 重连 =====

  private handleReconnect(): void {
    if (this.manualClose) return
    if (
      this.reconnectConfig.maxRetries !== -1 &&
      this.retryCount >= this.reconnectConfig.maxRetries
    ) {
      return
    }

    const cfg = this.reconnectConfig
    const delay = Math.min(
      cfg.initialDelay * Math.pow(cfg.multiplier, this.retryCount),
      cfg.maxDelay,
    )

    this.retryCount++
    this.reconnectTimer = setTimeout(() => {
      this.doConnect()
    }, delay)
  }

  // ===== 消息队列 =====

  private flushQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const msg = this.messageQueue.shift()!
      this.ws.send(msg)
    }
  }

  // ===== 工具 =====

  private emitState(state: WsState): void {
    this.onStateChangeCb?.(state)
  }

  private clearConnectTimer(): void {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer)
      this.connectTimer = null
    }
  }

  private clearTimers(): void {
    this.clearConnectTimer()
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}
