<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ProfileAPI from "@/api/profile";
import UploadAPI from "@/api/upload";
import { useUserStore } from "@/store/modules/user";

const userStore = useUserStore();
const activeTab = ref("info");
const loading = ref(false);

// 定义上传地址
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + "/api/file/upload");
// 如果需要，还可以定义上传请求头，用于携带token
const uploadHeaders = ref({
  Authorization: "Bearer " + userStore.token,
});
// 个人信息
const profileInfo = ref({});
const profileForm = reactive({
  realName: "",
  email: "",
  phone: "",
  avatar: "",
});

// 修改密码表单
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});

const passwordRules = {
  oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度必须在6-20个字符之间", trigger: "blur" },
  ],
  confirmNewPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 登录日志相关
const loginLogs = ref([]);
const logTotal = ref(0);
const logQuery = reactive({
  pageNum: 1,
  pageSize: 5,
});

const passwordFormRef = ref(null);
const avatarUploaderRef = ref(null);

// 表格列配置
const columns = [
  {
    prop: "loginTime",
    label: "登录时间",
    width: 200,
    formatter: (row) => {
      return formatDateTime(row.loginTime);
    },
  },
  {
    prop: "loginIp",
    label: "登录IP",
    width: 150,
  },
  {
    prop: "userAgent",
    label: "用户代理",
    showOverflowTooltip: true,
    width: 650,
  },
  {
    prop: "status",
    label: "状态",
    width: 100,
    slot: "status",
  },
  {
    prop: "failReason",
    label: "失败原因",
    showOverflowTooltip: true,
  },
];

// 获取个人信息
const getProfile = async () => {
  try {
    loading.value = true;
    const data = await ProfileAPI.getProfile();
    profileInfo.value = data;
    profileForm.realName = data.realName || "";
    profileForm.email = data.email || "";
    profileForm.phone = data.phone || "";
    if (data.avatar) {
      try {
        const avatarUrl = await UploadAPI.getFileUrl(data.avatar);
        // 将获取到的URL同时更新到用于显示的 profileInfo 和用于表单的 profileForm
        profileInfo.value.avatar = avatarUrl;
        profileForm.avatar = avatarUrl;
      } catch (urlError) {
        console.error("获取头像URL失败:", urlError);
        // 如果获取URL失败，可以设置一个默认头像或留空
        profileInfo.value.avatar = ""; // 或者一个默认图片URL
        profileForm.avatar = "";
      }
    } else {
      // 如果用户没有头像，则清空
      profileInfo.value.avatar = "";
      profileForm.avatar = "";
    }
  } catch (error) {
    ElMessage.error(error.message || "获取个人信息失败");
  } finally {
    loading.value = false;
  }
};

// 更新个人信息
const handleUpdateProfile = async () => {
  try {
    await ProfileAPI.updateProfile(profileForm);
    ElMessage.success("更新成功");
    await getProfile();
    // 更新store中的用户信息
    await userStore.getInfo();
  } catch (error) {
    ElMessage.error(error.message || "更新失败");
  }
};

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;

  try {
    const valid = await passwordFormRef.value.validate();
    if (!valid) return;

    await ElMessageBox.confirm("修改密码后需要重新登录，确认继续吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await ProfileAPI.changePassword(passwordForm);
    ElMessage.success("密码修改成功，请重新登录");

    // 延迟后退出登录
    setTimeout(async () => {
      await userStore.logout();
    }, 1500);
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "修改密码失败");
    }
  }
};

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmNewPassword = "";
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate();
  }
};

// 获取登录日志
const getLoginLogs = async () => {
  try {
    loading.value = true;
    const data = await ProfileAPI.getLoginLogs(logQuery.pageNum, logQuery.pageSize);
    loginLogs.value = data.records;
    logTotal.value = data.total;
  } catch (error) {
    ElMessage.error(error.message || "获取登录日志失败");
  } finally {
    loading.value = false;
  }
};

// 时间格式化函数
const formatDateTime = (dateTime) => {
  if (!dateTime) return "暂无数据";

  try {
    let date;

    // 处理不同的时间格式
    if (Array.isArray(dateTime)) {
      // 数组格式 [2025, 10, 5, 13, 18, 4]
      if (dateTime.length >= 6) {
        date = new Date(
          dateTime[0],
          dateTime[1] - 1,
          dateTime[2],
          dateTime[3],
          dateTime[4],
          dateTime[5],
        );
      } else {
        return "时间格式错误";
      }
    } else if (typeof dateTime === "string") {
      // 字符串格式
      date = new Date(dateTime);
    } else if (typeof dateTime === "number") {
      // 时间戳格式
      date = new Date(dateTime);
    } else {
      return "时间格式错误";
    }

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return "时间格式错误";
    }

    // 格式化为中文本地时间
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("时间格式化错误:", error);
    return "时间格式错误";
  }
};

// 头像上传成功回调
const handleAvatarSuccess = async (response) => {
  console.log("上传响应:", response);
  if (response && response.data && response.data.fileKey) {
    try {
      // 1. 从上传响应中获取 fileKey
      const fileKey = response.data.fileKey;

      // 2. 使用 fileKey 调用新API，获取完整的URL
      const urlResponse = await UploadAPI.getFileUrl(fileKey);

      // 3. 将获取到的完整URL赋值给表单，用于显示
      profileForm.avatar = urlResponse;
      ElMessage.success("头像上传成功");
    } catch (error) {
      console.error("获取图片URL失败:", error);
      ElMessage.error("获取图片URL失败");
    }
  } else {
    ElMessage.error("头像上传失败，未返回fileKey");
  }
};

// 头像上传失败回调
const handleAvatarError = (error) => {
  console.error("上传失败:", error);
  ElMessage.error("头像上传失败");
};

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("只能上传图片文件!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("头像图片大小不能超过 2MB!");
    return false;
  }
  return true;
};

// 切换标签页
const handleTabChange = (name) => {
  if (name === "logs") {
    getLoginLogs();
  } else if (name === "password") {
    resetPasswordForm();
  }
};

const handleHeaderAvatarClick = () => {
  if (avatarUploaderRef.value) {
    // 模拟点击 el-upload 内部的 input
    avatarUploaderRef.value.$el.querySelector("input").click();
  }
};
// 修改邮箱相关
const changeEmailDialogVisible = ref(false);
const changeEmailForm = reactive({
  newEmail: "",
  captcha: "",
});
const changeEmailFormRef = ref(null);
const sendEmailCodeLoading = ref(false);
const changeEmailLoading = ref(false);
const emailCodeCountdown = ref(0);
let emailCodeTimer = null;

// 修改邮箱表单规则
const changeEmailRules = {
  newEmail: [
    { required: true, message: "请输入新邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: ["blur", "change"] },
  ],
  captcha: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { len: 6, message: "验证码必须是6位", trigger: "blur" },
  ],
};

// 打开修改邮箱对话框
const handleOpenChangeEmail = () => {
  changeEmailDialogVisible.value = true;
  changeEmailForm.newEmail = "";
  changeEmailForm.captcha = "";
  if (changeEmailFormRef.value) {
    changeEmailFormRef.value.clearValidate();
  }
};

// 发送邮箱验证码
const handleSendEmailCode = async () => {
  if (!changeEmailFormRef.value) return;

  try {
    await changeEmailFormRef.value.validateField("newEmail");

    if (changeEmailForm.newEmail === profileInfo.value.email) {
      ElMessage.warning("新邮箱不能与当前邮箱相同");
      return;
    }

    sendEmailCodeLoading.value = true;
    await ProfileAPI.sendChangeEmailCode(changeEmailForm.newEmail);
    ElMessage.success("验证码已发送到新邮箱");

    // 开始倒计时
    emailCodeCountdown.value = 60;
    emailCodeTimer = setInterval(() => {
      emailCodeCountdown.value--;
      if (emailCodeCountdown.value <= 0) {
        clearInterval(emailCodeTimer);
      }
    }, 1000);
  } catch (error) {
    if (error && error.message) {
      ElMessage.error(error.message || "发送验证码失败");
    }
  } finally {
    sendEmailCodeLoading.value = false;
  }
};

// 提交修改邮箱
const handleSubmitChangeEmail = async () => {
  if (!changeEmailFormRef.value) return;

  try {
    const valid = await changeEmailFormRef.value.validate();
    if (!valid) return;

    changeEmailLoading.value = true;
    await ProfileAPI.changeEmail(changeEmailForm.newEmail, changeEmailForm.captcha);
    ElMessage.success("邮箱修改成功");

    // 关闭对话框
    changeEmailDialogVisible.value = false;

    // 刷新个人信息
    await getProfile();
    await userStore.getInfo();
  } catch (error) {
    ElMessage.error(error.message || "邮箱修改失败");
  } finally {
    changeEmailLoading.value = false;
  }
};

// 关闭对话框时清理
const handleCloseChangeEmailDialog = () => {
  if (emailCodeTimer) {
    clearInterval(emailCodeTimer);
    emailCodeCountdown.value = 0;
  }
};

// 组件卸载时清理定时器
onUnmounted(() => {
  if (emailCodeTimer) {
    clearInterval(emailCodeTimer);
  }
});

onMounted(() => {
  getProfile();
});
</script>

<template>
  <div class="profile-container">
    <el-card shadow="never" class="profile-card">
      <!-- 个人信息头部 -->
      <div class="profile-header">
        <div style="cursor: pointer" title="点击更换头像" @click="handleHeaderAvatarClick">
          <el-avatar :size="100" :src="profileInfo.avatar" class="avatar">
            <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
          </el-avatar>
        </div>
        <div class="user-info">
          <h2 class="username">{{ profileInfo.username }}</h2>
          <div class="info-item">
            <el-tag type="success" size="large">{{ profileInfo.roleName }}</el-tag>
          </div>
          <div class="info-item">
            <el-icon><i-ep-calendar /></el-icon>
            <span>加入时间：{{ formatDateTime(profileInfo.createTime) }}</span>
          </div>
          <div class="info-item">
            <el-icon><i-ep-clock /></el-icon>
            <span>最后登录：{{ formatDateTime(profileInfo.lastLoginTime) }}</span>
          </div>
        </div>
      </div>

      <!-- Tab 切换 -->
      <el-tabs v-model="activeTab" class="profile-tabs" @tab-change="handleTabChange">
        <!-- 个人信息 -->
        <el-tab-pane label="个人信息" name="info">
          <el-form
            :model="profileForm"
            label-width="100px"
            class="profile-form"
            style="max-width: 600px"
          >
            <el-form-item label="用户名">
              <el-input v-model="profileInfo.username" disabled />
            </el-form-item>
            <el-form-item label="真实姓名">
              <el-input v-model="profileForm.realName" placeholder="请输入真实姓名" />
            </el-form-item>
            <el-form-item label="邮箱">
              <div style="display: flex; gap: 10px; width: 100%">
                <el-input
                  v-model="profileForm.email"
                  placeholder="请输入邮箱"
                  disabled
                  style="flex: 1"
                />
                <el-button type="primary" @click="handleOpenChangeEmail"> 修改邮箱 </el-button>
              </div>
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="头像">
              <div class="avatar-upload-container">
                <el-upload
                  ref="avatarUploaderRef"
                  class="avatar-uploader"
                  :action="uploadUrl"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :on-error="handleAvatarError"
                  :before-upload="beforeAvatarUpload"
                  accept="image/*"
                >
                  <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar-preview" />
                  <el-icon v-else class="avatar-uploader-icon">
                    <i-ep-plus />
                  </el-icon>
                </el-upload>
                <div class="upload-tip">
                  <p>点击上传头像</p>
                  <p>支持 JPG、PNG 格式，大小不超过 2MB</p>
                </div>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdateProfile">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 修改密码 -->
        <el-tab-pane label="修改密码" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="120px"
            class="profile-form"
            style="max-width: 600px"
          >
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入旧密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码（6-20个字符）"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmNewPassword">
              <el-input
                v-model="passwordForm.confirmNewPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword">确认修改</el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 登录日志 -->
        <el-tab-pane label="登录日志" name="logs">
          <AppTable
            v-model:page-num="logQuery.pageNum"
            v-model:page-size="logQuery.pageSize"
            :data="loginLogs"
            :columns="columns"
            :loading="loading"
            :total="logTotal"
            :show-export="false"
            :show-column-control="false"
            :excel-name="登录日志"
            @refresh="getLoginLogs"
            ><template #status="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? "成功" : "失败" }}
              </el-tag>
            </template>
          </AppTable>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 修改邮箱对话框 -->
    <el-dialog
      v-model="changeEmailDialogVisible"
      title="修改邮箱"
      width="500px"
      :before-close="handleCloseChangeEmailDialog"
    >
      <el-form
        ref="changeEmailFormRef"
        :model="changeEmailForm"
        :rules="changeEmailRules"
        label-width="100px"
      >
        <el-form-item label="当前邮箱">
          <el-input :value="profileInfo.email || '未设置'" disabled />
        </el-form-item>

        <el-form-item label="新邮箱" prop="newEmail">
          <el-input v-model="changeEmailForm.newEmail" placeholder="请输入新邮箱地址" />
        </el-form-item>

        <el-form-item label="验证码" prop="captcha">
          <div style="display: flex; gap: 10px; width: 100%">
            <el-input
              v-model="changeEmailForm.captcha"
              placeholder="请输入6位验证码"
              maxlength="6"
              style="flex: 1"
            />
            <el-button
              :disabled="emailCodeCountdown > 0"
              :loading="sendEmailCodeLoading"
              style="min-width: 120px"
              @click="handleSendEmailCode"
            >
              {{ emailCodeCountdown > 0 ? `${emailCodeCountdown}秒后重发` : "发送验证码" }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="changeEmailDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="changeEmailLoading" @click="handleSubmitChangeEmail">
            确定修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.profile-container {
  padding: 20px;
}

.profile-card {
  border-radius: 8px;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 30px;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;

  .avatar {
    margin-right: 30px;
    border: 4px solid rgba(255, 255, 255, 0.3);
  }

  .user-info {
    flex: 1;
    color: #fff;

    .username {
      margin: 0 0 15px 0;
      font-size: 28px;
      font-weight: bold;
    }

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      font-size: 14px;

      .el-icon {
        margin-right: 8px;
        font-size: 16px;
      }
    }
  }
}

.profile-tabs {
  margin-top: 20px;
}

.profile-form {
  padding: 20px 0;
}

.avatar-upload-container {
  display: flex;
  gap: 20px;
  align-items: center;

  .avatar-uploader {
    :deep(.el-upload) {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }

    .avatar-uploader-icon {
      width: 100px;
      height: 100px;
      font-size: 28px;
      line-height: 100px;
      color: #8c939d;
      text-align: center;
    }

    .avatar-preview {
      display: block;
      width: 100px;
      height: 100px;
      object-fit: cover;
    }
  }

  .upload-tip {
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-regular);

    p {
      margin: 0 0 4px 0;
    }
  }
}
</style>
