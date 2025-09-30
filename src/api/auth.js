import request from "@/utils/request";

const AuthAPI = {
  // 登录接口
  login(username, password, captcha, captchaKey) {
    return request({
      url: "/admin/auth/login",
      method: "POST",
      data: {
        username,
        password,
        captcha,
        captchaKey,
      },
    });
  },

  // 获取图形验证码接口
  getCaptcha(captchaId) {
    return request({
      url: "/captcha/graph-captcha",
      method: "GET",
      params: {
        captchaId,
      },
    });
  },

  // 获取当前登录管理员信息
  getInfo() {
    return request({
      url: "/admin/auth/info",
      method: "GET",
    });
  },

  // 退出登录
  logout() {
    return request({
      url: "/admin/auth/logout",
      method: "POST",
    });
  },

  // 重置管理员密码
  resetPassword(adminId) {
    return request({
      url: `/admin/auth/resetPassword/${adminId}`,
      method: "PUT",
    });
  },
};

export default AuthAPI;
