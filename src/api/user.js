import request from "@/utils/request";

const prefix = "/admin/user";

// 获取用户列表（分页）
export const getUserList = (params) =>
  request({
    url: `${prefix}/list`,
    method: "get",
    params,
  });

// 获取用户详情
export const getUserDetail = (id) =>
  request({
    url: `${prefix}/${id}`,
    method: "get",
  });

// 获取用户基本信息（用于编辑）
export const getUserBasic = (id) =>
  request({
    url: `${prefix}/${id}/basic`,
    method: "get",
  });

// 更新用户信息
export const updateUser = (id, data) =>
  request({
    url: `${prefix}/${id}`,
    method: "put",
    data,
  });

// 删除用户
export const deleteUser = (ids) =>
  request({
    url: `${prefix}/${ids}`,
    method: "delete",
  });

// 批量删除用户
export const batchDeleteUsers = (ids) =>
  request({
    url: `${prefix}/batch`,
    method: "delete",
    data: ids,
  });

// 更新用户状态
export const updateUserStatus = (id, status) =>
  request({
    url: `${prefix}/${id}/status`,
    method: "put",
    params: { status },
  });

// 批量更新用户状态
export const batchUpdateUserStatus = (ids, status) =>
  request({
    url: `${prefix}/batch/status`,
    method: "put",
    data: ids,
    params: { status },
  });

// 导出用户数据
export const exportUsers = (params) =>
  request({
    url: `${prefix}/export`,
    method: "get",
    params,
    responseType: "blob",
  });

// 获取用户统计信息
export const getUserStatistics = () =>
  request({
    url: `${prefix}/statistics`,
    method: "get",
  });
