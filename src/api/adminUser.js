import request from "@/utils/request";

const prefix = "/admin/manage/users";
// 接口统一前缀，所有用户管理相关接口都在这个路径下

// 获取用户列表（支持分页、搜索等查询参数）
export const getAdminUserList = (params) => request({ url: prefix, method: "get", params });

// 获取指定用户详情
export const getAdminUser = (id) => request({ url: `${prefix}/${id}`, method: "get" });

// 添加新用户
export const addAdminUser = (data) => request({ url: prefix, method: "post", data });

// 更新用户信息
export const updateAdminUser = (id, data) =>
  request({ url: `${prefix}/${id}`, method: "put", data });

// 删除用户
export const deleteAdminUser = (id) => request({ url: `${prefix}/${id}`, method: "delete" });
