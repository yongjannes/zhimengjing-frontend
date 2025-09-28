import { createApp } from "vue";
import App from "./App.vue";
import "uno.css";
import "virtual:svg-icons-register";
import globalComponent from "./components/index";

import "@/styles/index.scss";

import { setupStore } from "@/store/idnex";

import router from "@/router";

import "element-plus/dist/index.css";

import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";

const app = createApp(App);

app.use(ElementPlus, {
  locale: zhCn,
});
// 全局注册 store
setupStore(app);

app.use(globalComponent);
app.use(router);

app.mount("#app");
