import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const store = createPinia();
store.use(piniaPluginPersistedstate);
// 注册 Pinia
export function setupStore(app) {
  app.use(store); // 全局注册 Pinia
}
