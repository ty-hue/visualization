import {
  BorderBox1,
  FullScreenContainer,
  BorderBox3,
  BorderBox8,
  BorderBox9,
  BorderBox7,
  BorderBox2,
  CapsuleChart,
  ScrollRankingBoard,
  WaterLevelPond,
  ActiveRingChart,
} from "@kjgl77/datav-vue3";
import type { App } from "vue";

export default function initDataV(app: App) {
  app.component("BorderBox1", BorderBox1);
  app.component("FullScreenContainer", FullScreenContainer);
  app.component("BorderBox3", BorderBox3);
  app.component("BorderBox8", BorderBox8);
  app.component("BorderBox9", BorderBox9);
  app.component("BorderBox7", BorderBox7);
  app.component("BorderBox2", BorderBox2);
  app.component("CapsuleChart", CapsuleChart);
  app.component("ScrollRankingBoard", ScrollRankingBoard);
  app.component("WaterLevelPond", WaterLevelPond);
  app.component("ActiveRingChart", ActiveRingChart);
}
