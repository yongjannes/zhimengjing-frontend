import { defineStore } from "pinia";
import AuthAPI from "@/api/auth";
import { usePermissionStore } from "@/store/modules/permission";
import router from "@/router/index.js";

export const useUserStore = defineStore(
  "user",
  () => {
    const token = ref(null);
    const userInfo = ref(null);
    const isLoggedIn = computed(() => !!token.value);

    function setLoginState(loginResult) {
      token.value = loginResult.token || null;
    }

    function clearLoginState() {
      token.value = null;
      userInfo.value = null;
    }

    const login = async (payload) => {
      try {
        const response = await AuthAPI.login(
          payload.username,
          payload.password,
          payload.captcha,
          payload.captchaKey,
        );
        setLoginState(response);
        return true; // 登录成功返回 true
      } catch (error) {
        // 错误已由 request.js 中的响应拦截器统一处理并提示
        console.error("登录 Action 失败:", error);
        clearLoginState();
        return false; // 登录失败返回 false
      }
    };

    // 获取用户信息
    const getInfo = async () => {
      try {
        const response = await AuthAPI.getInfo();
        userInfo.value = response;
        return response;
      } catch (error) {
        console.error("获取用户信息失败:", error);
        return null;
      }
    };

    // 退出登录
    const logout = async () => {
      const permissionStore = usePermissionStore();
      try {
        await AuthAPI.logout();
      } catch (error) {
        console.error("登出 Action 失败:", error);
      } finally {
        // 无论接口调用成功与否，都清空前端登录状态
        clearLoginState();
        permissionStore.resetRoutes();
        router.replace("/login");
      }
    };

    return {
      token,
      userInfo,
      isLoggedIn,
      login,
      getInfo,
      logout,
    };
  },
  {
    persist: {
      key: "userStore",
      paths: ["token", "userInfo"],
    },
  },
);
