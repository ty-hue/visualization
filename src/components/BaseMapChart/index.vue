<template>
  <div ref="chartRef" :style="style"></div>
</template>

<script setup lang="ts">
import { useWebSocket } from "@/composables/useWebSocket";
import type { MessageHandler, WsClientOptions } from "@/utils/websocket/types";
import * as echarts from "echarts";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    width?: string;
    height?: string;
    /** 地图 JSON 数据 */
    mapJson: Record<string, any>;
    /** 地图名称 */
    mapName: string;
    option: Record<string, any>;
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
    width: "100%",
    height: "400px",
  },
);

const style = computed(() => ({
  width: props.width,
  height: props.height,
}));

const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

const optionRef = ref(props.option);

const initChart = () => {
  if (!chartRef.value) return;
  echarts.registerMap(props.mapName, props.mapJson as any);
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
  resizeObserver = new ResizeObserver(() => {
    chart?.resize();
  });
  resizeObserver.observe(chartRef.value as Element);
  initWebSocket();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  chart?.dispose();
  chart = null;
  wsUnsub?.();
  wsUnsub = null;
});
</script>

<style scoped lang="less"></style>
