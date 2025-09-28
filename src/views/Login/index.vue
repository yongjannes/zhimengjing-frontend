<script setup>
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import AuthAPI from "@/api/auth";

const router = useRouter();

const loginForm = ref({
  username: "",
  password: "",
  captcha: "",
  captchaKey: "",
});

const captchaImg = ref("");

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  password: [{ required: true, trigger: "blur", message: "请输入密码" }],
  captcha: [{ required: true, trigger: "blur", message: "请输入验证码" }],
};

const loading = ref(false);
const loginFormRef = ref(null);

const getCaptcha = async () => {
  try {
    const response = await AuthAPI.getCaptcha(loginForm.value.uuid);
    captchaImg.value = response.captchaImage;
    loginForm.value.captchaKey = response.captchaId;
  } catch (error) {
    ElMessage.error(error.message || "获取验证码失败");
  }
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  try {
    const valid = await loginFormRef.value.validate();
    if (!valid) return;

    loading.value = true;

    const res = await AuthAPI.login(
      loginForm.value.username,
      loginForm.value.password,
      loginForm.value.captcha,
      loginForm.value.captchaKey,
    );

    if (res?.token) {
      localStorage.setItem("token", res.token);
    }

    ElMessage.success("登录成功");
    router.push({ path: "/" });
  } catch (error) {
    ElMessage.error(error.message || "登录失败");
    await getCaptcha();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getCaptcha();
});
</script>

<template>
  <div class="login-container">
    <!-- 主登录卡片 -->
    <div class="login-card">
      <!-- 头部标题 -->
      <div class="card-header">
        <h1 class="title">欢迎回来</h1>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        auto-complete="off"
        label-position="top"
      >
        <el-form-item prop="username">
          <div class="input-group" style="width: 320px">
            <el-input v-model="loginForm.username" placeholder="用户名" class="custom-input" />
            <el-icon class="input-icon"><i-ep-User /></el-icon>
          </div>
        </el-form-item>
        <el-form-item prop="password">
          <div class="input-group" style="width: 320px">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              class="custom-input"
              @keyup.enter="handleLogin"
            />
            <el-icon class="input-icon"><i-ep-Lock /></el-icon>
          </div>
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-wrapper">
            <div class="input-group captcha-input">
              <el-input
                v-model="loginForm.captcha"
                placeholder="请输入验证码"
                class="custom-input"
              />
              <el-icon class="input-icon"><i-ep-Key /></el-icon>
            </div>
            <div class="captcha-img-wrapper" @click="getCaptcha">
              <img :src="captchaImg" class="captcha-img" alt="验证码" />
              <div class="refresh-overlay">
                <el-icon><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </el-form-item>

        <div class="login-actions">
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登录中...</span>
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
/* 全局样式 */
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-family:
    "Helvetica Neue", "Hiragino Sans GB", "WenQuanYi Micro Hei", "Microsoft Yahei", sans-serif;
  color: #333;
  background: url("@/assets/images/background.jpg") no-repeat;
  background-size: cover;
}

/* 登录容器样式 */
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

/* 标题样式 */
.card-header .title {
  margin-bottom: 35px;
  font-size: 32px;
  font-weight: 700;
  color: #333;
}

/* 表单样式 */
.login-form {
  text-align: left;
}

/* 输入框组样式 - 统一布局 */
.input-group {
  position: relative;
  margin-bottom: 25px;
}

.input-group .input-icon {
  position: absolute;
  top: 50%;
  left: 15px;
  z-index: 10;
  font-size: 20px;
  color: #999;
  transform: translateY(-50%);
  transition: color 0.3s ease;
}

.input-group:focus-within .input-icon {
  color: #71b7e6;
}

/* Element Plus 输入框样式覆盖 */
.custom-input :deep(.el-input__wrapper) {
  height: 50px;
  padding: 0 15px 0 50px;
  font-size: 16px;
  outline: none;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.custom-input :deep(.el-input__inner) {
  height: 100%;
  padding-left: 0;
  line-height: 50px;
}

/* 验证码区域样式 */
.captcha-wrapper {
  display: flex;
  gap: 15px;
  align-items: stretch;
}

.captcha-input {
  flex: 1;
}

.captcha-input :deep(.el-input__wrapper) {
  height: 50px;
}

.captcha-img-wrapper {
  position: relative;
  width: 130px;
  height: 50px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.captcha-img-wrapper:hover {
  border-color: #71b7e6;
  box-shadow: 0 0 10px rgba(113, 183, 230, 0.5);
}

.captcha-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.refresh-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(113, 183, 230, 0.9);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.captcha-img-wrapper:hover .refresh-overlay {
  opacity: 1;
}

.refresh-overlay .el-icon {
  font-size: 18px;
  color: white;
}

/* 登录按钮样式 */
.login-button {
  width: 100%;
  height: 55px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  border: none;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.login-button:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  transform: translateY(-3px);
}

/* Element Plus 表单项样式覆盖 */
:deep(.el-form-item) {
  margin-bottom: 25px;
}

:deep(.el-form-item__label) {
  display: none;
}

:deep(.el-form-item__error) {
  padding-top: 5px;
  font-size: 14px;
  line-height: 1;
  color: #f56c6c;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .login-container {
    padding: 20px;
  }

  .login-card {
    max-width: 100%;
  }

  .captcha-wrapper {
    flex-direction: column;
    gap: 20px;
  }

  .captcha-img-wrapper {
    width: 100%;
    height: 55px;
  }
}
</style>
