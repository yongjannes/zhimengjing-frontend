import { defineStore } from "pinia";
import { ref, computed } from "vue";
import AuthAPI from "@/api/auth";

export const useUserStore = defineStore("user", () => {
  // 浏览器 localStorage 获取初始值
  const token = ref(localStorage.getItem("token"));
  const userInfo = ref(JSON.parse(localStorage.getItem("userInfo") || "null"));

  const isLoggedIn = computed(() => !!token.value && !!userInfo.value);

  function setLoginState(loginResult) {
    token.value = loginResult.token || null;
    userInfo.value = {
      userName: loginResult.userName,
      avatar: loginResult.avatar,
    };
    localStorage.setItem("token", token.value ?? "");
    localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
  }

  function clearLoginState() {
    token.value = null;
    userInfo.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
  }

  const login = async (payload) => {
    try {
      const response = await AuthAPI.login(
        payload.userAccount,
        payload.password || "",
        payload.captchaId,
        payload.captcha,
      );
      setLoginState(response);
    } catch (error) {
      console.error("登录 Action 失败:", error);
      clearLoginState();
      throw error;
    }
  };

  const logout = () => {
    clearLoginState();
  };

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    setLoginState,
  };
});
