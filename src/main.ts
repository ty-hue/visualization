import { createApp } from "vue";
import "@/assets/css/main.css";
import router from "./router";
import pinia from "./store";
import DataV from "./global/dataV";

import App from "./App.vue";

createApp(App).use(router).use(pinia).use(DataV).mount("#app");
