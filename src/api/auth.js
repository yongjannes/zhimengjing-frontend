import request from "@/utils/request";

const AuthAPI = {
  /**
   * 用户登录接口
   *
   * @param userAccount 用户账号
   * @param password 用户密码
   * @param captchaId 验证码 ID
   * @param captcha 用户输入的验证码
   * @returns 返回包含 token 和用户信息的 Promise
   */
  login(userAccount, password, captchaId, captcha) {
    // 调用封装好的 request 方法发送 POST 请求
    return request({
      url: "/user/login", // 请求的接口地址
      method: "POST", // 请求方法为 POST
      data: {
        userAccount,
        password,
        captchaId,
        captcha,
      },
    });
  },

  /**
   * 获取图形验证码接口
   *
   * @param captchaId 可选参数，用于刷新同一个验证码
   * @returns 返回包含验证码ID和图像的 Promise
   */
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
