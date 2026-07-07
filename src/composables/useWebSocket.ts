import { ref, computed, onUnmounted, type Ref } from "vue";
import { WsClient } from "@/utils/websocket";
import { WsState } from "@/utils/websocket/types";
import type { WsClientOptions, MessageHandler } from "@/utils/websocket/types";

/** useWebSocket 返回值 */
export interface UseWebSocketReturn {
  /** 连接状态 */
  state: Ref<WsState>;
  /** 是否已连接 */
  isOpen: Ref<boolean>;
  /** 发送消息 */
  send: (data: string | ArrayBuffer | object) => void;
  /** 订阅消息，返回取消函数 */
  on: (type: string, handler: MessageHandler) => () => void;
  /** 手动断开（会清理所有资源） */
  disconnect: () => void;
  /** 手动重连 */
  reconnect: () => void;
}

/**
 * Vue 组合式 WebSocket Hook
 *
 * @example
 * ```ts
 * const { isOpen, on, send } = useWebSocket({ url: 'ws://localhost:8080' })
 *
 * on('sales', (data) => {
 *   config.value = formatData(data)
 * })
 * ```
 */
export function useWebSocket(options: WsClientOptions): UseWebSocketReturn {
  const state = ref<WsState>(WsState.CLOSED);
  const isOpen = computed(() => state.value === WsState.OPEN);
  const client = new WsClient(options);

  // 状态同步
  client.onStateChange((s) => {
    state.value = s;
  });

  // 建立连接
  client.connect();

  let unsubscribers: (() => void)[] = [];

  /**
   * 订阅消息，自动在组件卸载时取消
   * 也可以手动调用返回的取消函数提前取消
   */
  function on(type: string, handler: MessageHandler): () => void {
    const unsub = client.on(type, handler);
    unsubscribers.push(unsub);
    return () => {
      unsub();
      unsubscribers = unsubscribers.filter((f) => f !== unsub);
    };
  }

  function send(data: string | ArrayBuffer | object): void {
    client.send(data);
  }

  function disconnect(): void {
    client.disconnect();
  }

  function reconnect(): void {
    client.disconnect();
    client.connect();
  }

  // 组件卸载时自动清理
  onUnmounted(() => {
    unsubscribers.forEach((fn) => fn());
    unsubscribers = [];
    client.disconnect();
  });

  return { state, isOpen, send, on, disconnect, reconnect };
}
