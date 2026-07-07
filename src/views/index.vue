<template>
  <full-screen-container>
    <!-- ========== 第一行：h-1/5 ========== -->
    <div class="flex h-1/5">
      <!-- 区域1：胶囊图 — 各地区销售额排名 -->
      <div class="basis-1/2 grow-0 shrink-0">
        <border-box8>
          <base-data-v
            component-name="CapsuleChart"
            :config="capsuleBaseConfig"
            :ws-options="wsOptions"
            ws-message-type="capsule-data"
            :transform-fn="(raw) => ({ ...capsuleBaseConfig, data: raw.data })"
            class="w-full h-full p-2"
          />
        </border-box8>
      </div>
      <!-- 区域2：活跃环图 — 各行业渗透率 -->
      <div class="basis-1/2 grow-0 shrink-0">
        <border-box3>
          <div class="w-full h-full overflow-hidden">
            <base-data-v
              component-name="ActiveRingChart"
              :config="ringBaseConfig"
              :ws-options="wsOptions"
              ws-message-type="ring-data"
              :transform-fn="(raw) => ({ ...ringBaseConfig, data: raw.data })"
              class="w-full h-full p-2"
            />
          </div>
        </border-box3>
      </div>
    </div>

    <!-- ========== 第二行：h-3/5 ========== -->
    <div class="flex h-3/5">
      <!-- 左列：1/4 -->
      <div class="basis-1/4 grow-0 shrink-0 flex flex-col">
        <!-- 区域3：折线图 — 24h 流量趋势 -->
        <border-box9 class="flex-1 min-h-0">
          <base-chart
            :option="{}"
            :ws-options="wsOptions"
            ws-message-type="line-data"
            :transform-fn="buildLineOption"
            class="w-full h-full"
          />
        </border-box9>
        <!-- 区域4：柱状图 — 各省份交易笔数 -->
        <border-box7 class="flex-1 min-h-0">
          <base-chart
            :option="{}"
            :ws-options="wsOptions"
            ws-message-type="bar-data"
            :transform-fn="buildBarOption"
            class="w-full h-full"
          />
        </border-box7>
        <!-- 区域5：水球图 — CPU 使用率 -->
        <border-box1 class="flex-1 min-h-0">
          <base-data-v
            component-name="WaterLevelPond"
            :config="waterBaseConfig"
            :ws-options="wsOptions"
            ws-message-type="water-data"
            :transform-fn="
              (raw) => ({ ...waterBaseConfig, data: [raw.data.value] })
            "
            class="w-full h-full overflow-hidden"
          />
        </border-box1>
      </div>

      <!-- 中列：1/2 — 中国地图 -->
      <div class="basis-1/2 grow-0 shrink-0">
        <border-box8>
          <base-map-chart
            :map-json="chinaMap"
            map-name="china"
            :option="{}"
            :ws-options="wsOptions"
            ws-message-type="map-data"
            :transform-fn="buildMapOption"
            class="w-full h-full"
          />
        </border-box8>
      </div>

      <!-- 右列：1/4 -->
      <div class="basis-1/4 grow-0 shrink-0 flex flex-col">
        <!-- 区域7：滚动排名 — 产品销量排行 -->
        <border-box1 class="flex-1 min-h-0">
          <base-data-v
            component-name="ScrollRankingBoard"
            :config="scrollBaseConfig"
            :ws-options="wsOptions"
            ws-message-type="scroll-data"
            :transform-fn="(raw) => ({ ...scrollBaseConfig, data: raw.data })"
            class="w-full h-full p-2"
          />
        </border-box1>
        <!-- 区域8：饼图 — 市场份额分布 -->
        <border-box7 class="flex-1 min-h-0">
          <base-chart
            :option="{}"
            :ws-options="wsOptions"
            ws-message-type="pie-data"
            :transform-fn="buildPieOption"
            class="w-full h-full"
          />
        </border-box7>
      </div>
    </div>

    <!-- ========== 第三行：h-1/5 ========== -->
    <div class="flex h-1/5">
      <!-- 区域9：多系列柱状图 — 各部门季度对比 -->
      <div class="basis-7/10 grow-0 shrink-0">
        <border-box7>
          <base-chart
            :option="{}"
            :ws-options="wsOptions"
            ws-message-type="multi-bar-data"
            :transform-fn="buildMultiBarOption"
            class="w-full h-full"
          />
        </border-box7>
      </div>
      <!-- 区域10：仪表盘 — 系统健康度 -->
      <div class="basis-3/10 grow-0 shrink-0">
        <border-box9>
          <base-chart
            :option="{}"
            :ws-options="wsOptions"
            ws-message-type="gauge-data"
            :transform-fn="buildGaugeOption"
            class="w-full h-full"
          />
        </border-box9>
      </div>
    </div>
  </full-screen-container>
</template>

<script setup lang="ts">
import BaseChart from "@/components/BaseChart/index.vue";
import BaseMapChart from "@/components/BaseMapChart/index.vue";
import BaseDataV from "@/components/BaseDataV/index.vue";
import chinaMap from "@/assets/json/chinaMap.json";

// ============================================================
// WebSocket 连接配置
// ============================================================
const wsOptions = { url: "ws://localhost:3000" };

// ============================================================
// DataV 组件静态配置（样式/颜色等不变的部分）
// ============================================================

const capsuleBaseConfig = {
  colors: [
    "#e062ae",
    "#fb7293",
    "#e690d1",
    "#32c5e9",
    "#96bfff",
    "#ffd85c",
    "#67e0e3",
  ],
  unit: "万元",
  showValue: true,
};

const ringBaseConfig = {
  colors: ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd"],
  radius: "70%",
  activeRadius: "80%",
  lineWidth: 16,
  activeTimeGap: 2000,
  digitalFlopStyle: { fontSize: 24, fill: "#fff" },
};

const waterBaseConfig = {
  shape: "round",
  colors: ["#48dbfb", "#0abde3"],
  waveNum: 3,
};

const scrollBaseConfig = {
  rowNum: 5,
  waitTime: 2000,
  carousel: "single",
  unit: "件",
  sort: false,
};

// ============================================================
// ECharts 通用样式片段
// ============================================================

const darkGrid = { left: 50, right: 20, top: 15, bottom: 25 };
const darkXAxis = {
  type: "category" as const,
  axisLabel: { color: "#a0c8e0", fontSize: 10 },
  axisLine: { lineStyle: { color: "#1e3a5f" } },
};
const darkYAxis = {
  type: "value" as const,
  axisLabel: { color: "#a0c8e0" },
  splitLine: { lineStyle: { color: "#1e3a5f", type: "dashed" as const } },
};

// ============================================================
// ECharts option 构建函数（配置固定在前端，只注入数据）
// ============================================================

/** 3. 折线图：24h 流量趋势 */
function buildLineOption(raw: any) {
  const d = raw.data;
  return {
    backgroundColor: "transparent",
    grid: darkGrid,
    xAxis: {
      ...darkXAxis,
      data: d.categories,
      axisLabel: { ...darkXAxis.axisLabel, rotate: 45 },
    },
    yAxis: darkYAxis,
    tooltip: { trigger: "axis" },
    series: d.series.map((s: any) => ({
      name: s.name,
      type: "line",
      smooth: true,
      symbol: "none",
      data: s.data,
      lineStyle: { width: 2 },
    })),
    color: ["#48dbfb", "#ff9ff3"],
  };
}

/** 4. 柱状图：各省份交易笔数 */
function buildBarOption(raw: any) {
  const d = raw.data;
  return {
    backgroundColor: "transparent",
    grid: { ...darkGrid, left: 55 },
    xAxis: { ...darkXAxis, data: d.categories },
    yAxis: darkYAxis,
    tooltip: { trigger: "axis" },
    series: [
      {
        type: "bar",
        data: d.values,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#54a0ff" },
              { offset: 1, color: "#5f27cd" },
            ],
          },
        },
        barWidth: 20,
      },
    ],
  };
}

/** 6. 地图：各省新冠病毒感染人数 */
function buildMapOption(raw: any) {
  const { list, min, max } = raw.data;
  return {
    backgroundColor: "transparent",
    tooltip: { trigger: "item", formatter: "新冠感染人数<br> {b}: {c} 人" },
    visualMap: {
      min,
      max,
      left: "left",
      bottom: "bottom",
      text: ["高", "低"],
      textStyle: { color: "#a0c8e0" },
      inRange: {
        color: ["#fdebd0", "#f5b7b1", "#e74c3c", "#c0392b", "#7b241c"],
      },
      calculable: true,
    },
    series: [
      {
        type: "map",
        map: "china",
        roam: false,
        // layoutCenter: ["50%", "50%"],
        // layoutSize: "100%",
        zoom: 1.15,
        aspectScale: 0.85,
        itemStyle: {
          areaColor: "#0e2a4a",
          borderColor: "#1e5a9e",
          borderWidth: 1,
        },
        emphasis: {
          label: { color: "#fff", fontSize: 12 },
          itemStyle: { areaColor: "#2a6db5" },
        },
        data: list,
      },
    ],
  };
}

/** 8. 饼图：市场份额分布 */
function buildPieOption(raw: any) {
  return {
    backgroundColor: "transparent",
    tooltip: { trigger: "item" },
    legend: { bottom: 5, textStyle: { color: "#a0c8e0", fontSize: 10 } },
    series: [
      {
        type: "pie",
        radius: ["45%", "70%"],
        center: ["50%", "45%"],
        roseType: "radius",
        itemStyle: { borderRadius: 4, borderColor: "#0a1a3a", borderWidth: 2 },
        label: { color: "#a0c8e0", fontSize: 10 },
        data: raw.data,
      },
    ],
    color: ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd"],
  };
}

/** 9. 多系列柱状图：各部门季度对比 */
function buildMultiBarOption(raw: any) {
  const d = raw.data;
  return {
    backgroundColor: "transparent",
    grid: darkGrid,
    legend: {
      data: d.series.map((s: any) => s.name),
      textStyle: { color: "#a0c8e0", fontSize: 10 },
      top: 0,
    },
    xAxis: { ...darkXAxis, data: d.categories },
    yAxis: darkYAxis,
    tooltip: { trigger: "axis" },
    series: d.series.map((s: any) => ({
      name: s.name,
      type: "bar",
      barWidth: 12,
      data: s.data,
      itemStyle: { borderRadius: [2, 2, 0, 0] },
    })),
    color: ["#ff6b6b", "#feca57", "#48dbfb", "#54a0ff"],
  };
}

/** 10. 仪表盘：系统健康度 */
function buildGaugeOption(raw: any) {
  return {
    backgroundColor: "transparent",
    series: [
      {
        type: "gauge",
        startAngle: 210,
        endAngle: -30,
        center: ["50%", "55%"],
        radius: "85%",
        min: 0,
        max: 100,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 12,
            color: [
              [0.3, "#ff6b6b"],
              [0.7, "#feca57"],
              [1, "#48dbfb"],
            ],
          },
        },
        pointer: { length: "60%", width: 6, itemStyle: { color: "#a0c8e0" } },
        axisTick: {
          distance: -12,
          length: 6,
          lineStyle: { color: "#a0c8e0", width: 1 },
        },
        splitLine: {
          distance: -20,
          length: 16,
          lineStyle: { color: "#a0c8e0", width: 2 },
        },
        axisLabel: { color: "#a0c8e0", fontSize: 10, distance: 25 },
        detail: {
          valueAnimation: true,
          fontSize: 24,
          color: "#fff",
          offsetCenter: [0, "70%"],
          formatter: "{value}%",
        },
        data: [{ value: raw.data.value }],
      },
    ],
  };
}
</script>
