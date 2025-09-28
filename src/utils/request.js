import axios, { AxiosHeaders } from "axios";
import { ElMessage } from "element-plus";

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 5000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // 确保 headers 不为 undefined，并用 AxiosHeaders 包装
      config.headers = new AxiosHeaders(config.headers ?? {});
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const resData = response?.data;
    if (resData?.code === 200) {
      return resData.data;
    } else {
      ElMessage.error(resData?.message || "业务处理失败");
      return Promise.reject({
        message: resData?.message || "业务处理失败",
        code: resData?.code,
      });
    }
  },
  (error) => {
    const status = error?.response?.status;
    let msg = "";

    if (status) {
      switch (status) {
        case 401:
          msg = "登录状态失效，请重新登录";
          break;
        case 403:
          msg = "无权访问";
          break;
        case 404:
          msg = "请求地址错误";
          break;
        case 500:
          msg = "服务器出现问题";
          break;
        default:
          msg = `未知错误: ${status}`;
      }
      ElMessage.error(msg);
    } else if (error?.code === "ECONNABORTED") {
      msg = "请求超时，请稍后重试";
      ElMessage.error(msg);
    } else if (error?.message?.includes("Network Error")) {
      msg = "网络连接失败，请检查网络";
      ElMessage.error(msg);
    } else {
      msg = "网络异常，请检查连接";
      ElMessage.error(msg);
    }

    return Promise.reject(new Error(msg));
  },
);

// 封装 httpRequest 方法
export default function httpRequest(options) {
  return request(options);
}
