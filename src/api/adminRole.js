import request from "@/utils/request";

const prefix = "/admin/role";

export const getAllRoles = () =>
  request({
    url: `${prefix}/list`,
    method: "get",
  });
