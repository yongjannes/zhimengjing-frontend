import { defineStore } from "pinia";
import { ref } from "vue";
import router from "@/router";
import { constantRoutes, asyncRoutes, anyRoute } from "@/router/modules/home";

export const usePermissionStore = defineStore(
  "permission",
  () => {
    // 保存用户当前可访问的所有路由（静态 + 动态）
    const routes = ref([]);
    // 仅保存动态添加的路由
    const addRoutes = ref([]);

    // 判断当前路由是否有权限访问
    const hasPermission = (permissions, route) => {
      // 如果路由没有权限限制，或者用户权限包含该路由权限，则允许访问
      return !route.meta?.permission || permissions.includes(route.meta.permission);
    };

    // 递归过滤异步路由，只保留用户有权限的路由
    const filterAsyncRoutes = (routesToFilter, permissions) => {
      const res = [];

      routesToFilter.forEach((route) => {
        // 浅拷贝路由对象，避免修改原始路由
        const tmp = { ...route };

        if (hasPermission(permissions, tmp)) {
          // 如果有子路由，递归过滤
          if (tmp.children) {
            tmp.children = filterAsyncRoutes(tmp.children, permissions);
            // 只有子路由不为空才保留父路由
            if (tmp.children.length > 0) {
              res.push(tmp);
            }
          } else {
            // 没有子路由，直接保留
            res.push(tmp);
          }
        }
      });

      return res;
    };

    // 根据用户权限生成动态路由
    const generateRoutes = async (permissions) => {
      let accessedRoutes;

      // 如果用户拥有全部权限，直接使用所有异步路由
      if (permissions.includes("*")) {
        accessedRoutes = asyncRoutes || [];
      } else {
        // 否则过滤异步路由，只保留有权限的
        accessedRoutes = filterAsyncRoutes(asyncRoutes, permissions);
      }

      // 添加任意路由到末尾（例如 404 页面）
      accessedRoutes.push(anyRoute);

      // 保存动态路由状态
      addRoutes.value = accessedRoutes;
      // 合并静态路由和动态路由
      routes.value = [...constantRoutes, ...accessedRoutes];

      // 动态添加路由到 Vue Router 实例
      accessedRoutes.forEach((route) => {
        if (!router.hasRoute(route.name)) {
          router.addRoute(route);
        }
      });

      return accessedRoutes;
    };

    // 重置路由状态（登出时使用）
    const resetRoutes = () => {
      routes.value = [];
      addRoutes.value = [];
    };

    return {
      routes,
      addRoutes,
      generateRoutes,
      resetRoutes,
    };
  },
  {
    persist: {
      key: "permissionStore", // 本地存储 key
      paths: ["routes", "addRoutes"], // 需要持久化的 state
    },
  },
);
