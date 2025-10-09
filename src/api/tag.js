import request from "@/utils/request";

const prefix = "/admin/tags";

// 分页获取标签列表
export const getTagsByPage = (params) =>
  request({
    url: prefix,
    method: "get",
    params,
  });

// 根据ID获取标签详情
export const getTagById = (id) =>
  request({
    url: `${prefix}/${id}`,
    method: "get",
  });

// 新增标签
export const addTag = (data) =>
  request({
    url: prefix,
    method: "post",
    data,
  });

// 更新标签
export const updateTag = (id, data) =>
  request({
    url: `${prefix}/${id}`,
    method: "put",
    data,
  });

// 删除标签
export const deleteTag = (ids) =>
  request({
    url: `${prefix}`,
    method: "delete",
    params: {
      ids,
    },
  });

// 切换标签状态
export const toggleTagStatus = (id, isActive) =>
  request({
    url: `${prefix}/${id}/status`,
    method: "put",
    params: {
      isActive,
    },
  });

// 获取热门标签
export const getPopularTags = (limit = 10) =>
  request({
    url: `${prefix}/popular`,
    method: "get",
    params: {
      limit,
    },
  });

// 搜索标签
export const searchTags = (keyword) =>
  request({
    url: `${prefix}/search`,
    method: "get",
    params: {
      keyword,
    },
  });

// 合并标签
export const mergeTags = (data) =>
  request({
    url: `${prefix}/merge`,
    method: "post",
    data,
  });

// 更新标签使用次数
export const updateTagUsageCount = (id) =>
  request({
    url: `${prefix}/${id}/usage-count`,
    method: "put",
  });
