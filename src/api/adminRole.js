import request from "@/utils/request";

const prefix = "/admin/role";

// 分页获取角色列表
export const getRolesByPage = (params) =>
  request({
    url: `${prefix}/list`,
    method: "get",
    params,
  });

export const getAllRoles = () =>
  request({
    url: `${prefix}/list-all`,
    method: "get",
  });

// 根据ID获取角色详情
export const getRoleById = (id) =>
  request({
    url: `${prefix}/${id}`,
    method: "get",
  });

// 新增角色
export const addRole = (data) =>
  request({
    url: prefix,
    method: "post",
    data,
  });

// 更新角色
export const updateRole = (id, data) =>
  request({
    url: prefix,
    method: "put",
    data: { ...data, id },
  });

// 删除角色 (支持批量)
export const deleteRole = (ids) =>
  request({
    url: `${prefix}/${ids}`,
    method: "delete",
  });
