import { createRouter, createWebHistory } from "vue-router";
import { constantRoutes } from "./modules/home/index.js";
import { useUserStore } from "@/store/modules/user";
import { start, close } from "@/utils/nporgress";
import { ElMessage } from "element-plus";
import { usePermissionStore } from "@/store/modules/permission";

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
});

// 添加路由守卫
const whiteList = ["/login"]; // 不需要登录就可以访问的页面路径

router.beforeEach(async (to, from, next) => {
  start(); // 开启进度条
  const userStore = useUserStore();
  const token = userStore.token;
  const permissionStore = usePermissionStore();
  if (token) {
    if (to.path === "/login") {
      // 如果已登录，访问登录页则重定向到首页
      next({ path: "/" });
    } else {
      if (userStore.userInfo) {
        next(); // 如果有用户信息，直接放行
      } else {
        try {
          // 异步获取用户信息（包含权限）
          const userInfo = await userStore.getInfo();
          const permissions = userInfo.permissions;
          // 根据权限生成动态路由
          const permissionStore = usePermissionStore();
          const accessRoutes = await permissionStore.generateRoutes(permissions);

          // 动态添加路由
          accessRoutes.forEach((route) => {
            router.addRoute(route);
          });

          // 确保路由完全添加后，再进行跳转
          next({ ...to, replace: true });
        } catch (error) {
          // 如果出错，则登出并重新登录
          await userStore.logout();
          ElMessage.error(error.message || "获取权限失败，请重新登录");
          next(`/login?redirect=${to.path}`);
        }
      }
    }
  } else {
    // 没有 token
    if (whiteList.includes(to.path)) {
      // 在免登录白名单中，直接放行
      next();
    } else {
      // 否则全部重定向到登录页
      ElMessage.warning("请先登录");
      next(`/login?redirect=${to.path}`);
    }
  }
});

// 路由跳转结束后关闭进度条
router.afterEach(() => {
  close(); // 关闭进度条
});

export default router;
