<template>
  <full-screen-container>
    <div class="flex h-1/5">
      <div class="basis-1/2 grow-0 shrink-0">
        <border-box8>
          <capsule-chart :config="config" class="w-full h-full" />
        </border-box8>
      </div>
      <div class="basis-1/2 grow-0 shrink-0">
        <border-box3></border-box3>
      </div>
    </div>
    <div class="flex h-3/5">
      <div class="basis-1/4 grow-0 shrink-0 flex flex-col">
        <border-box9></border-box9>
        <border-box7></border-box7>
        <border-box1></border-box1>
      </div>
      <div class="basis-1/2 grow-0 shrink-0">
        <border-box8></border-box8>
      </div>
      <div class="basis-1/4 grow-0 shrink-0 flex flex-col">
        <border-box1></border-box1>
        <border-box7></border-box7>
      </div>
    </div>
    <div class="flex h-1/5">
      <div class="basis-7/10 grow-0 shrink-0">
        <border-box7></border-box7>
      </div>
      <div class="basis-3/10 grow-0 shrink-0">
        <border-box9></border-box9>
      </div>
    </div>
  </full-screen-container>
</template>

<script setup lang="ts">
import { ref } from "vue";

const config = ref({
  data: [
    {
      name: "南阳",
      value: 167,
    },
    {
      name: "周口",
      value: 123,
    },
    {
      name: "漯河",
      value: 98,
    },
    {
      name: "郑州",
      value: 75,
    },
    {
      name: "西峡",
      value: 66,
    },
  ],
  colors: ["#e062ae", "#fb7293", "#e690d1", "#32c5e9", "#96bfff"],
  unit: "单位",
  showValue: true,
});
</script>
