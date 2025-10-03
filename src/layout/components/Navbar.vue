<script setup>
import { useSettingStore } from "@/store/modules/setting";
import { useRoute } from "vue-router";
import Settings from "./Settings.vue";
import { useUserStore } from "@/store/modules/user";

const settingStore = useSettingStore();
const route = useRoute();
const userStore = useUserStore();

// 刷新页面
const handleRefresh = () => {
  window.location.reload();
};

// 全屏切换
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm("确定退出登录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    // 用户点击了确定
    await userStore.logout();
    ElMessage({
      message: "退出成功",
      type: "success",
      duration: 2000,
    });
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    // 用户点击了取消或关闭弹窗，不做任何操作
  }
};
</script>

<template>
  <div class="navbar">
    <div class="navbar-left">
      <div class="hamburger-container" @click="settingStore.toggleCollapse">
        <el-icon class="hamburger-icon">
          <i-ep-expand v-if="settingStore.isCollapse" />
          <i-ep-fold v-else />
        </el-icon>
      </div>

      <el-breadcrumb separator-icon="ArrowRight" class="breadcrumb">
        <el-breadcrumb-item
          v-for="(item, index) in route.matched"
          v-show="item.meta.title"
          :key="index"
          :to="item.path"
        >
          <el-icon v-if="item.meta.icon" class="breadcrumb-icon">
            <component :is="item.meta.icon" />
          </el-icon>
          <span class="breadcrumb-title">{{ item.meta.title }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="right-menu">
      <div class="right-menu-item" title="刷新页面" @click="handleRefresh">
        <el-icon><i-ep-refresh /></el-icon>
      </div>
      <div class="right-menu-item" title="全屏切换" @click="toggleFullScreen">
        <el-icon><i-ep-full-screen /></el-icon>
      </div>
      <Settings />
      <el-dropdown trigger="click">
        <span class="avatar-wrapper">
          <img :src="userStore.userInfo?.avatar" class="user-avatar" alt="用户头像" />
          <span class="user-name">{{ userStore.userInfo?.username || "用户" }}</span>
          <el-icon class="el-icon--right"><i-ep-arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background: var(--el-bg-color);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  transition: all 0.3s ease;
}

/* 左边区域 */
.navbar-left {
  display: flex;
  align-items: center;

  .hamburger-container {
    padding: 6px;
    margin-right: 15px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--el-color-primary-light-9);
    }

    .hamburger-icon {
      font-size: 20px;
      color: var(--el-text-color-primary);
      cursor: pointer;
      transition: transform 0.3s ease;
    }
  }

  .breadcrumb {
    font-size: 14px;
    color: var(--el-text-color-regular);

    .breadcrumb-icon {
      margin-right: 4px;
      font-size: 16px;
      vertical-align: middle;
      color: var(--el-color-primary);
    }

    .breadcrumb-title {
      margin-left: 2px;
      font-weight: 500;
    }
  }
}

/* 右边区域 */
.right-menu {
  display: flex;
  align-items: center;

  .avatar-wrapper {
    display: flex;
    align-items: center;
    padding: 0 10px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--el-color-primary-light-9);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border: 2px solid var(--el-border-color-lighter);
      border-radius: 50%;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--el-color-primary);
      }
    }

    .user-name {
      max-width: 80px;
      margin-left: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }

    .el-icon--right {
      margin-left: 5px;
      color: var(--el-text-color-regular);
    }
  }

  .right-menu-item {
    padding: 8px;
    margin: 0 5px;
    font-size: 18px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }
}
</style>
