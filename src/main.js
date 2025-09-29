import { createApp } from "vue";
import App from "./App.vue";
import "uno.css";
import "virtual:svg-icons-register";
import globalComponent from "./components/index";

import "@/styles/index.scss";

import { setupStore } from "@/store/index.js";

import router from "@/router";

import "element-plus/dist/index.css";

import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus, {
  locale: zhCn,
});
// 全局注册 store
setupStore(app);

app.use(globalComponent);
app.use(router);

app.mount("#app");
