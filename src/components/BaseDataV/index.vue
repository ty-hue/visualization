<template>
  <component :is="componentName" :config="currentConfig" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useWebSocket } from "@/composables/useWebSocket";
import type { MessageHandler, WsClientOptions } from "@/utils/websocket/types";

// ===== Props =====
const props = defineProps<{
  /** DataV 组件名，如 "CapsuleChart" */
  componentName: string;
  /** 静态配置（无数据源时使用） */
  config?: Record<string, any>;
  /** WebSocket 配置 */
  wsOptions?: WsClientOptions;
  /** WebSocket 订阅的消息类型 */
  wsMessageType?: string;
  /** 数据转换：WS 返回的原始数据 → DataV config 格式 */
  transformFn?: (raw: any) => Record<string, any>;
}>();

// ===== 状态 =====
const currentConfig = ref<Record<string, any>>(props.config || {});
let wsUnsub: (() => void) | null = null;

// ===== WebSocket =====
function initWebSocket() {
  if (!props.wsOptions || !props.wsMessageType || !props.transformFn) return;

  const { on: wsOn } = useWebSocket(props.wsOptions);

  const handler: MessageHandler = (data: any) => {
    currentConfig.value = props.transformFn!(data);
  };

  wsUnsub = wsOn(props.wsMessageType, handler);
}

// ===== 生命周期 =====
onMounted(() => {
  if (props.wsOptions) {
    initWebSocket();
  }
});

onUnmounted(() => {
  wsUnsub?.();
});
</script>
