import request from "@/utils/request";

const prefix = "/admin/categories";

// 分页获取梦境分类列表
export const getCategoriesByPage = (params) =>
  request({
    url: prefix,
    method: "get",
    params,
  });

// 获取所有梦境分类（树形结构）
export const getAllCategories = () =>
  request({
    url: `${prefix}/tree`,
    method: "get",
  });

// 根据ID获取梦境分类详情
export const getCategoryById = (id) =>
  request({
    url: `${prefix}/${id}`,
    method: "get",
  });

// 新增梦境分类
export const addCategory = (data) =>
  request({
    url: prefix,
    method: "post",
    data,
  });

// 更新梦境分类
export const updateCategory = (id, data) =>
  request({
    url: `${prefix}/${id}`,
    method: "put",
    data,
  });

// 删除梦境分类
export const deleteCategory = (ids) =>
  request({
    url: `${prefix}`,
    method: "delete",
    params: {
      ids,
    },
  });
