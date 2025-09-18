<script setup>
import { ref, onMounted } from "vue";
import AuthAPI from "@/api/auth";
import { useUserStore } from "@/store/modules/user";

// 用户 store
const userStore = useUserStore();

// 表单数据
const userAccount = ref("");
const password = ref("");
const captcha = ref("");
const captchaId = ref("");

// 验证码图片
const captchaImage = ref("");

// 加载状态与错误提示
const loading = ref(false);
const errorMsg = ref("");

// 获取验证码
async function fetchCaptcha() {
  try {
    const result = await AuthAPI.getCaptcha();
    // 保存验证码 ID（隐藏，不显示给用户）
    captchaId.value = result.captchaId || "";
    // 保存验证码图片 URL，直接赋值
    captchaImage.value = result.captchaImage || "";
  } catch (err) {
    errorMsg.value = err.message || "获取验证码失败";
  }
}

// 登录
async function handleLogin() {
  errorMsg.value = "";
  loading.value = true;
  try {
    await userStore.login({
      userAccount: userAccount.value,
      password: password.value,
      captchaId: captchaId.value, // 隐藏的验证码ID
      captcha: captcha.value, // 用户输入的验证码内容
    });
    window.location.href = "/";
  } catch (err) {
    errorMsg.value = err.message || "登录失败";
    // 登录失败刷新验证码
    await fetchCaptcha();
  } finally {
    loading.value = false;
  }
}

// 页面加载时获取验证码
onMounted(() => {
  fetchCaptcha();
});
</script>

<template>
  <div class="button-row">
    <el-button>Default</el-button>
    <el-button type="primary">Primary</el-button>
    <el-button type="success">Success</el-button>
    <el-button type="info">Info</el-button>
    <el-button type="warning">Warning</el-button>
    <el-button type="danger">Danger</el-button>
  </div>

  <div class="block">
    <span class="demonstration">Months</span>
    <el-date-picker type="months" placeholder="Pick one or more months" />
  </div>

  <el-button type="primary"><i-ep-edit />编辑</el-button>
  <el-button type="success"><i-ep-check />成功</el-button>

  <div class="login-page">
    <h2>登录</h2>
    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    <div class="form-item">
      <label>账号：</label>
      <input v-model="userAccount" type="text" placeholder="请输入账号" />
    </div>
    <div class="form-item">
      <label>密码：</label>
      <input v-model="password" type="password" placeholder="请输入密码" />
    </div>
    <div class="form-item captcha">
      <label>验证码：</label>
      <input v-model="captcha" type="text" placeholder="请输入验证码" />
      <img :src="captchaImage" alt="验证码" @click="fetchCaptcha" />
    </div>
    <button :disabled="loading" @click="handleLogin">{{ loading ? "登录中..." : "登录" }}</button>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  width: 300px;
  padding: 20px;
  margin: 50px auto;
  border: 1px solid #ccc;
  border-radius: 8px;

  h2 {
    margin-bottom: 20px;
    text-align: center;
  }

  .form-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    label {
      width: 70px;
    }

    input {
      flex: 1;
      padding: 5px;
    }

    &.captcha {
      img {
        height: 38px;
        margin-left: 10px;
        cursor: pointer;
      }
    }
  }

  .error {
    margin-bottom: 10px;
    color: red;
    text-align: center;
  }

  button {
    width: 100%;
    padding: 8px 0;
    color: #fff;
    cursor: pointer;
    background-color: #409eff;
    border: none;
    border-radius: 4px;

    &:disabled {
      cursor: not-allowed;
      background-color: #a0cfff;
    }
  }
}
</style>
