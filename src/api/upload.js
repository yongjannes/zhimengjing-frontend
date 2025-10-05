import request from "@/utils/request";

const UploadAPI = {
  // 上传文件
  uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    return request({
      url: "/api/upload",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getFileUrl(fileKey) {
    return request({
      url: "/api/file/url",
      method: "GET",
      params: {
        fileKey,
      },
    });
  },
};

export default UploadAPI;
