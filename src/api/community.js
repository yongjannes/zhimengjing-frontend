import request from "@/utils/request";

const prefix = "/admin/community";

// 分页查询帖子列表
export const getPostList = (params) =>
  request({
    url: `${prefix}/posts/list`,
    method: "get",
    params,
  });

// 查询帖子统计信息
export const getPostStatistics = () =>
  request({
    url: `${prefix}/posts/statistics`,
    method: "get",
  });

// 根据ID查询帖子详情
export const getPostDetail = (id) =>
  request({
    url: `${prefix}/posts/${id}`,
    method: "get",
  });

// 审核帖子
export const auditPosts = (data) =>
  request({
    url: `${prefix}/posts/audit`,
    method: "post",
    data,
  });

// 批量删除帖子
export const deletePosts = (ids) =>
  request({
    url: `${prefix}/posts/${ids}`,
    method: "delete",
  });

// 切换置顶状态
export const togglePostTop = (id) =>
  request({
    url: `${prefix}/posts/toggle-top/${id}`,
    method: "put",
  });

// 切换热门状态
export const togglePostHot = (id) =>
  request({
    url: `${prefix}/posts/toggle-hot/${id}`,
    method: "put",
  });
