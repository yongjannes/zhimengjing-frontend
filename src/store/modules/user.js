import { defineStore } from "pinia";
import AuthAPI from "@/api/auth";
import ProfileAPI from "@/api/profile";
import { usePermissionStore } from "@/store/modules/permission";
import router from "@/router/index.js";
import { useTabsStore } from "./tabs";

export const useUserStore = defineStore(
  "user",
  () => {
    const token = ref(null);
    const userInfo = ref(null);

    const avatarUrl = ref(null);
    const avatarExpiresAt = ref(0);

    const isLoggedIn = computed(() => !!token.value);

    const avatar = computed(
      () =>
        avatarUrl.value || "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    );
    function setLoginState(loginResult) {
      token.value = loginResult.token || null;
    }

    function clearLoginState() {
      token.value = null;
      userInfo.value = null;
      avatarUrl.value = null;
      avatarExpiresAt.value = 0;
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
        if (response.avatar && response.avatar.url) {
          avatarUrl.value = response.avatar.url;
          avatarExpiresAt.value = response.avatar.expiresAt;
        } else {
          avatarUrl.value = null;
          avatarExpiresAt.value = 0;
        }
        return response;
      } catch (error) {
        console.error("获取用户信息失败:", error);
        return null;
      }
    };

    const refreshAvatarUrl = async () => {
      try {
        console.log("Refreshing avatar URL silently...");
        const response = await ProfileAPI.refreshAvatar();
        if (response && response.url && response.expiresAt) {
          avatarUrl.value = response.url;
          avatarExpiresAt.value = response.expiresAt;
          console.log("Avatar URL refreshed successfully.");
        }
      } catch (error) {
        console.error("Failed to refresh avatar URL:", error);
      }
    };

    // 退出登录
    const logout = async () => {
      const permissionStore = usePermissionStore();
      const tabsStore = useTabsStore();
      try {
        await AuthAPI.logout();
      } catch (error) {
        console.error("登出 Action 失败:", error);
      } finally {
        // 无论接口调用成功与否，都清空前端登录状态
        clearLoginState();
        permissionStore.resetRoutes();
        tabsStore.closeAllTabs();
        router.replace("/login");
      }
    };

    return {
      token,
      userInfo,
      isLoggedIn,
      avatar,
      avatarUrl,
      avatarExpiresAt,
      login,
      getInfo,
      logout,
      refreshAvatarUrl,
    };
  },
  {
    persist: {
      key: "userStore",
      paths: ["token", "userInfo", "avatarUrl", "avatarExpiresAt"],
    },
  },
);
