import { createPinia } from "pinia";

const store = createPinia();

// 注册 Pinia
export function setupStore(app) {
  app.use(store); // 全局注册 Pinia
}
