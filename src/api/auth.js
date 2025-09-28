import request from "@/utils/request";

const AuthAPI = {
  // 登录接口
  login(username, password, captcha, captchaKey) {
    // 调用封装好的 request 方法发送 POST 请求
    return request({
      url: "/admin/auth/login", // 请求的接口地址
      method: "POST", // 请求方法为 POST
      data: {
        username,
        password,
        captcha,
        captchaKey,
      },
    });
  },

  //获取图形验证码接口
  getCaptcha(captchaId) {
    return request({
      url: "/captcha/graph-captcha",
      method: "GET",
      params: {
        captchaId,
      },
    });
  },
};

export default AuthAPI;
