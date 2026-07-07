<template>
  <div ref="chartRef" :style="style"></div>
</template>

<script setup lang="ts">
import { useWebSocket } from "@/composables/useWebSocket";
import type { MessageHandler, WsClientOptions } from "@/utils/websocket/types";
import * as echarts from "echarts";
import { onBeforeUnmount, onMounted, ref, computed } from "vue";

const props = withDefaults(
  defineProps<{
    option: Record<string, any>;
    autoResize?: boolean;
    width?: string;
    height?: string;
    /** 静态配置（无数据源时使用） */
    config?: Record<string, any>;
    /** WebSocket 配置 */
    wsOptions?: WsClientOptions;
    /** WebSocket 订阅的消息类型 */
    wsMessageType?: string;
    /** 数据转换：WS 返回的原始数据 → DataV config 格式 */
    transformFn?: (raw: any) => Record<string, any>;
  }>(),
  {
    autoResize: true,
    width: "100%",
    height: "100%",
  },
);
const optionRef = ref(props.option);
const style = computed(() => ({
  width: props.width,
  height: props.height,
}));
const chartRef = ref(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

const initChart = () => {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  chart.setOption(optionRef.value);
};
let wsUnsub: (() => void) | null = null;

function initWebSocket() {
  if (!props.wsOptions || !props.wsMessageType || !props.transformFn) return;

  const { on: wsOn } = useWebSocket(props.wsOptions);

  const handler: MessageHandler = (data: any) => {
    optionRef.value = props.transformFn!(data);
    chart?.setOption(optionRef.value);
  };

  wsUnsub = wsOn(props.wsMessageType, handler);
}
onMounted(() => {
  initChart();
  if (
    props.autoResize &&
    chartRef.value &&
    typeof ResizeObserver !== "undefined"
  ) {
    resizeObserver = new ResizeObserver(() => chart?.resize());
    resizeObserver.observe(chartRef.value);
  }
  initWebSocket();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  chart?.dispose();
  chart = null;
  wsUnsub?.();
});

defineExpose({
  getInstance: () => chart,
  resize: () => chart?.resize(),
});
</script>

<style scoped></style>
