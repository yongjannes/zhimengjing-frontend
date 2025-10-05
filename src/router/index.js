import { createRouter, createWebHistory } from "vue-router";
import { constantRoutes } from "./modules/home/index.js";
import { useUserStore } from "@/store/modules/user";
import { usePermissionStore } from "@/store/modules/permission";
import { start, close } from "@/utils/nporgress";
import { ElMessage } from "element-plus";

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
});

// 白名单，不需要登录即可访问的路径
const whiteList = ["/login", "/forgot-password"];

// 动态路由添加标记
let isAddRoutes = false;

// 路由守卫
router.beforeEach(async (to, from, next) => {
  start(); // 开启进度条
  document.title = `织梦境 - ${to.meta.title || ""}`; // 设置页面标题

  const userStore = useUserStore();
  const permissionStore = usePermissionStore();
  const token = userStore.token;

  if (token) {
    // 已登录
    if (to.path === "/login") {
      // 如果已登录访问登录页，重定向到首页
      next({ path: "/" });
    } else {
      const now = Date.now();
      if (
        userStore.avatarUrl &&
        userStore.avatarExpiresAt &&
        userStore.avatarExpiresAt - now < 5 * 60 * 1000
      ) {
        // 静默调用刷新action，这个过程不影响下面的路由逻辑
        userStore.refreshAvatarUrl().catch((err) => {
          console.error("Silent refresh avatar failed:", err);
        });
      }
      // 判断用户信息是否存在
      if (userStore.userInfo) {
        // 用户信息存在
        if (!isAddRoutes) {
          // 动态路由还未添加
          const permissions = userStore.userInfo.permissions;
          const accessRoutes = await permissionStore.generateRoutes(permissions);
          accessRoutes.forEach((route) => router.addRoute(route));
          isAddRoutes = true;
          // 确保路由添加完成再跳转
          next({ ...to, replace: true });
        } else {
          // 动态路由已添加，直接放行
          next();
        }
      } else {
        // 用户信息不存在，异步获取
        try {
          const userInfo = await userStore.getInfo();
          const permissions = userInfo.permissions;
          const accessRoutes = await permissionStore.generateRoutes(permissions);
          accessRoutes.forEach((route) => router.addRoute(route));
          isAddRoutes = true;
          next({ ...to, replace: true });
        } catch (error) {
          // token 过期或获取信息失败，退出登录
          await userStore.logout();
          ElMessage.error(error.message || "获取权限失败，请重新登录");
          next(`/login?redirect=${to.path}`);
        }
      }
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      // 白名单直接放行
      next();
    } else {
      // 重定向到登录页
      ElMessage.warning("请先登录");
      next(`/login?redirect=${to.path}`);
    }
  }
});

// 路由跳转完成后关闭进度条
router.afterEach(() => {
  close();
});

export default router;
