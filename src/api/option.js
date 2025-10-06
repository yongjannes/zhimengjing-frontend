import request from "@/utils/request";

const prefix = "/admin/option";

// 获取权限列表
export const getPermissionOptions = () =>
  request({
    url: `${prefix}/permissions`,
    method: "get",
  });

// 获取角色列表
export const getRoleCodeOptions = () =>
  request({
    url: `${prefix}/role-codes`,
    method: "get",
  });
