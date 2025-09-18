import { createRouter, createWebHistory } from "vue-router";
import homeRoutes from "./modules/home";
import { useUserStore } from "@/store/modules/user";
import { start, close } from "@/utils/nporgress";

const router = createRouter({
  history: createWebHistory(),
  routes: [...homeRoutes],
});

// 添加路由守卫
const whiteList = ["/login"]; // 不需要登录就可以访问的页面路径

router.beforeEach(async (to, from, next) => {
  start(); // 开启进度条
  const userStore = useUserStore();
  const token = userStore.token; // 或者直接从 localStorage 获取

  if (token) {
    if (to.path === "/login") {
      // 如果已登录，访问登录页则重定向到首页
      next({ path: "/" });
    } else {
      // 如果有 token, 正常访问
      next();
    }
  } else {
    // 没有 token
    if (whiteList.includes(to.path)) {
      // 在免登录白名单中，直接放行
      next();
    } else {
      // 否则全部重定向到登录页
      next(`/login?redirect=${to.path}`);
    }
  }
});

// 路由跳转结束后关闭进度条
router.afterEach(() => {
  close(); // 关闭进度条
});

export default router;
