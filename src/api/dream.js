import request from "@/utils/request";

// 接口统一前缀
const prefix = "/admin/dreams";

// 获取梦境列表
export function getDreamList(params) {
  return request({
    url: `${prefix}/list`,
    method: "get",
    params,
  });
}

// 获取梦境统计
export function getDreamStatistics() {
  return request({
    url: `${prefix}/statistics`,
    method: "get",
  });
}

// 获取梦境详情
export function getDreamDetail(id) {
  return request({
    url: `${prefix}/${id}`,
    method: "get",
  });
}

// 审核梦境
export function auditDreams(data) {
  return request({
    url: `${prefix}/audit`,
    method: "put",
    data,
  });
}

// 删除梦境
export function deleteDreams(ids) {
  return request({
    url: `${prefix}/delete`,
    method: "delete",
    params: { ids },
  });
}
