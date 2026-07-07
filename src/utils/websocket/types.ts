/** WebSocket 连接状态 */
export const WsState = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const;

export type WsState = (typeof WsState)[keyof typeof WsState];

/** 心跳配置 */
export interface HeartbeatConfig {
  /** 心跳间隔（ms），默认 30000 */
  interval?: number;
  /** 超时时间（ms），超过此时间未收到 pong 视为断开，默认 5000 */
  timeout?: number;
  /** 心跳消息 */
  pingMessage?: string | (() => string | ArrayBuffer);
}

/** 重连配置 */
export interface ReconnectConfig {
  /** 最大重连次数，默认 5，设 -1 表示无限 */
  maxRetries?: number;
  /** 初始重连延迟（ms），默认 1000 */
  initialDelay?: number;
  /** 延迟倍增因子，默认 2（指数退避） */
  multiplier?: number;
  /** 最大延迟上限（ms），默认 30000 */
  maxDelay?: number;
}

/** WebSocket 客户端配置 */
export interface WsClientOptions {
  /** WebSocket 地址 */
  url: string;
  /** 子协议 */
  protocols?: string | string[];
  /** 心跳配置，传 false 关闭心跳 */
  heartbeat?: HeartbeatConfig | false;
  /** 重连配置，传 false 关闭重连 */
  reconnect?: ReconnectConfig | false;
  /** 连接超时（ms），默认 10000 */
  connectTimeout?: number;
  /** 断线时是否缓存待发消息，重连后自动发送 */
  queueWhileClosed?: boolean;
}

/** 消息处理器 */
export type MessageHandler<T = any> = (data: T) => void;

/** 消息订阅 */
export interface Subscription {
  /** 消息类型标识 */
  type: string;
  /** 回调函数 */
  handler: MessageHandler;
}
