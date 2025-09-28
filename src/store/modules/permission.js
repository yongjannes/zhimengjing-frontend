import { defineStore } from "pinia";
import { constantRoutes, asyncRoutes } from "@/router/modules/home";

export const usePermissionStore = defineStore(
  "permission",
  () => {
    // state
    const routes = ref([]); // 当前用户可访问的所有路由（静态 + 动态）
    const addRoutes = ref([]); // 仅动态添加的路由

    // 判断是否有权限
    function hasPermission(permissions, route) {
      const result = !route.meta?.permission || permissions.includes(route.meta.permission);

      return result;
    }

    // 递归过滤异步路由
    function filterAsyncRoutes(routes, permissions) {
      return routes.reduce((res, route) => {
        if (hasPermission(permissions, route)) {
          const tmp = { ...route };
          if (tmp.children) {
            tmp.children = filterAsyncRoutes(tmp.children, permissions);
          }
          if (!tmp.children || tmp.children.length > 0) {
            res.push(tmp);
          }
        }
        return res;
      }, []);
    }

    const generateRoutes = async (permissions) => {
      try {
        const userPermissions = permissions || [];

        const accessedRoutes = userPermissions.includes("*")
          ? asyncRoutes || []
          : filterAsyncRoutes(asyncRoutes, userPermissions);

        addRoutes.value = accessedRoutes;
        routes.value = [...constantRoutes, ...accessedRoutes];

        return accessedRoutes;
      } catch (error) {
        throw error;
      }
    };

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
      key: "permissionStore",
      paths: ["routes", "addRoutes"],
    },
  },
);
