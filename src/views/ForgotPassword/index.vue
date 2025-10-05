<script setup>
import { ref, reactive, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import AuthAPI from "@/api/auth";

const router = useRouter();

// 当前步骤
const currentStep = ref(1);

// 表单数据
const sendCodeForm = reactive({ identifier: "" });
const resetForm = reactive({
  email: "",
  captcha: "",
  newPassword: "",
  confirmPassword: "",
});

// 加载与倒计时状态
const sendCodeLoading = ref(false);
const resetLoading = ref(false);
const resendCountdown = ref(0); // 第二步倒计时
let resendTimer = null;

// 表单引用
const sendCodeFormRef = ref(null);
const resetFormRef = ref(null);

// 表单规则
const sendCodeRules = {
  identifier: [{ required: true, trigger: "blur", message: "请输入用户名或邮箱" }],
};
const resetRules = {
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: ["blur", "change"] },
  ],
  captcha: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { len: 6, message: "验证码必须是6位", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度必须在6-20个字符之间", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== resetForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 启动第二步按钮的60秒倒计时
const startResendCountdown = () => {
  resendCountdown.value = 60;
  resendTimer = setInterval(() => {
    resendCountdown.value--;
    if (resendCountdown.value <= 0) {
      clearInterval(resendTimer);
    }
  }, 1000);
};

// 发送验证码（第一步）
const handleSendCode = async () => {
  if (!sendCodeFormRef.value) return;

  const valid = await sendCodeFormRef.value.validate();
  if (!valid) return;

  sendCodeLoading.value = true;

  try {
    await AuthAPI.sendForgotPasswordCode(sendCodeForm.identifier);
    ElMessage.success("验证码已发送，请查收邮件");

    // 成功后，切换到第二步并为“重新发送”按钮启动倒计时
    currentStep.value = 2;
    if (sendCodeForm.identifier.includes("@")) {
      resetForm.email = sendCodeForm.identifier;
    }
    startResendCountdown();
  } catch (error) {
    console.error("发送验证码失败:", error);
  } finally {
    sendCodeLoading.value = false;
  }
};

// 重新发送验证码
const handleResendCode = async () => {
  if (resendCountdown.value > 0) return;
  const emailToSend = resetForm.email;
  if (!emailToSend) {
    ElMessage.warning("请输入邮箱地址");
    return;
  }
  try {
    await AuthAPI.sendForgotPasswordCode(emailToSend);
    ElMessage.success("验证码已重新发送");
    startResendCountdown();
  } catch (error) {
    console.error("重新发送验证码失败:", error);
  }
};

// 重置密码
const handleResetPassword = async () => {
  if (!resetFormRef.value) return;
  try {
    const valid = await resetFormRef.value.validate();
    if (!valid) return;
    resetLoading.value = true;
    await AuthAPI.resetPasswordByCaptcha(resetForm.email, resetForm.captcha, resetForm.newPassword);
    ElMessage.success("密码重置成功，请使用新密码登录");
    setTimeout(() => router.push("/login"), 1500);
  } catch (error) {
    console.error("密码重置失败:", error);
  } finally {
    resetLoading.value = false;
  }
};

const handleBack = () => {
  if (currentStep.value === 2) currentStep.value = 1;
};

const handleBackToLogin = () => {
  router.push("/login");
};

onUnmounted(() => {
  if (resendTimer) clearInterval(resendTimer);
});
</script>

<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <div class="card-header">
        <h1 class="title">找回密码</h1>
        <p class="subtitle">通过邮箱验证码重置您的密码</p>
      </div>

      <div class="steps">
        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <div class="step-number">1</div>
          <div class="step-label">验证身份</div>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }" />
        <div class="step" :class="{ active: currentStep >= 2 }">
          <div class="step-number">2</div>
          <div class="step-label">重置密码</div>
        </div>
      </div>

      <div v-show="currentStep === 1" class="step-content">
        <el-form
          ref="sendCodeFormRef"
          :model="sendCodeForm"
          :rules="sendCodeRules"
          label-position="top"
        >
          <el-form-item prop="identifier">
            <div class="input-group" style="width: 100%">
              <el-input
                v-model="sendCodeForm.identifier"
                placeholder="请输入用户名或邮箱"
                class="custom-input"
                size="large"
              >
                <template #prefix>
                  <el-icon>
                    <i-ep-User />
                  </el-icon>
                </template>
              </el-input>
            </div>
          </el-form-item>
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="sendCodeLoading"
            @click="handleSendCode"
          >
            发送验证码
          </el-button>
        </el-form>
      </div>

      <div v-show="currentStep === 2" class="step-content">
        <el-form
          ref="resetFormRef"
          :model="resetForm"
          :rules="resetRules"
          label-position="top"
          class="reset-form"
        >
          <el-form-item prop="email" label="邮箱">
            <el-input v-model="resetForm.email" placeholder="请输入绑定的邮箱" size="large">
              <template #prefix>
                <el-icon>
                  <i-ep-Message />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="captcha" label="验证码">
            <div class="captcha-group">
              <el-input
                v-model="resetForm.captcha"
                placeholder="请输入6位验证码"
                maxlength="6"
                size="large"
                class="captcha-input"
              >
                <template #prefix>
                  <el-icon>
                    <i-ep-Key />
                  </el-icon>
                </template>
              </el-input>
              <el-button
                size="large"
                type="primary"
                plain
                :disabled="resendCountdown > 0"
                class="resend-btn"
                @click="handleResendCode"
              >
                {{ resendCountdown > 0 ? `${resendCountdown}秒后重发` : "重新发送" }}
              </el-button>
            </div>
          </el-form-item>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item prop="newPassword" label="新密码">
                <el-input
                  v-model="resetForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  size="large"
                  show-password
                >
                  <template #prefix>
                    <el-icon>
                      <i-ep-Lock />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="confirmPassword" label="确认密码">
                <el-input
                  v-model="resetForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  size="large"
                  show-password
                  @keyup.enter="handleResetPassword"
                >
                  <template #prefix>
                    <el-icon>
                      <i-ep-Lock />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="action-buttons">
            <el-button size="large" @click="handleBack">上一步</el-button>
            <el-button
              type="primary"
              size="large"
              :loading="resetLoading"
              @click="handleResetPassword"
            >
              确认重置
            </el-button>
          </div>
        </el-form>
      </div>

      <div class="back-to-login">
        <el-link type="primary" @click="handleBackToLogin">
          <el-icon>
            <i-ep-ArrowLeft />
          </el-icon>
          返回登录
        </el-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.forgot-password-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: url("@/assets/images/background.jpg") no-repeat;
  background-size: cover;
}

.forgot-password-card {
  width: 100%;
  max-width: 480px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  margin-bottom: 40px;
  text-align: center;

  .title {
    margin: 0 0 10px 0;
    font-size: 28px;
    font-weight: 600;
    color: #333;
  }

  .subtitle {
    margin: 0;
    font-size: 14px;
    color: #999;
  }
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;

  .step {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;

    .step-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      font-size: 16px;
      font-weight: 600;
      color: #999;
      background: #e0e0e0;
      border-radius: 50%;
      transition: all 0.3s;
    }

    .step-label {
      font-size: 13px;
      color: #999;
      transition: all 0.3s;
    }

    &.active .step-number {
      color: white;
      background: #667eea;
    }

    &.active .step-label {
      color: #667eea;
    }

    &.completed .step-number {
      color: white;
      background: #52c41a;
    }
  }

  .step-line {
    width: 80px;
    height: 2px;
    margin: 0 10px;
    margin-bottom: 30px;
    background: #e0e0e0;
    transition: all 0.3s;

    &.active {
      background: #52c41a;
    }
  }
}

.step-content {
  .submit-btn {
    width: 100%;
    height: 44px;
    margin-top: 10px;
    font-size: 16px;
  }
}

.reset-form {
  :deep(.el-form-item) {
    margin-bottom: 22px;
  }

  :deep(.el-form-item__label) {
    padding: 0;
    margin-bottom: 6px;
    font-weight: 500;
    line-height: 22px;
    color: #606266;
  }

  .captcha-group {
    display: flex;
    gap: 10px;
    width: 100%;

    .captcha-input {
      flex: 1;
    }

    .resend-btn {
      min-width: 120px;
      height: 44px;
    }
  }

  .action-buttons {
    display: flex;
    gap: 16px;
    margin-top: 10px;

    .el-button {
      flex: 1;
      height: 44px;
    }
  }
}

.back-to-login {
  padding-top: 24px;
  margin-top: 24px;
  text-align: center;
  border-top: 1px solid #f0f0f0;
}

:deep(.el-input__wrapper) {
  box-sizing: border-box;
  height: 44px;
  padding: 12px 15px;
  border-radius: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
}
</style>
