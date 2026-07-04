import {
  BorderBox1,
  FullScreenContainer,
  BorderBox3,
  BorderBox8,
} from "@kjgl77/datav-vue3";
import type { App } from "vue";

export default function initDataV(app: App) {
  app.component("BorderBox1", BorderBox1);
  app.component("FullScreenContainer", FullScreenContainer);
  app.component("BorderBox3", BorderBox3);
  app.component("BorderBox8", BorderBox8);
}
