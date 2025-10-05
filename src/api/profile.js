import request from "@/utils/request";

const ProfileAPI = {
  // 获取个人信息
  getProfile() {
    return request({
      url: "/admin/profile/info",
      method: "GET",
    });
  },

  // 更新个人信息
  updateProfile(data) {
    return request({
      url: "/admin/profile/info",
      method: "PUT",
      data,
    });
  },

  // 修改密码
  changePassword(data) {
    return request({
      url: "/admin/profile/password",
      method: "PUT",
      data,
    });
  },

  // 获取登录日志
  getLoginLogs(pageNum, pageSize) {
    return request({
      url: "/admin/profile/loginLogs",
      method: "GET",
      params: {
        pageNum,
        pageSize,
      },
    });
  },
};

export default ProfileAPI;
