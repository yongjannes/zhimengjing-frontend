<script setup>
import { useSettingStore } from "@/store/modules/setting";
import { useRoute } from "vue-router";

const settingStore = useSettingStore();
const route = useRoute();
</script>

<template>
  <div class="navbar">
    <!-- 左侧 -->
    <div class="navbar-left">
      <!-- 汉堡按钮 -->
      <div class="hamburger-container" @click="settingStore.toggleCollapse">
        <el-icon>
          <i-ep-expand v-if="settingStore.isCollapse" />
          <i-ep-fold v-else />
        </el-icon>
      </div>

      <!-- 面包屑 -->
      <el-breadcrumb separator-icon="ArrowRight" class="breadcrumb">
        <el-breadcrumb-item
          v-for="(item, index) in route.matched"
          v-show="item.meta.title"
          :key="index"
          :to="item.path"
        >
          <!-- 图标 -->
          <el-icon v-if="item.meta.icon" class="breadcrumb-icon">
            <component :is="item.meta.icon" />
          </el-icon>
          <!-- 标题 -->
          <span class="breadcrumb-title">{{ item.meta.title }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧 -->
    <div class="right-menu">
      <el-dropdown trigger="click">
        <span class="avatar-wrapper">
          <img src="@/assets/vue.svg" class="user-avatar" />
          <el-icon class="el-icon--right"><i-ep-arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

/* 左边区域 */
.navbar-left {
  display: flex;
  align-items: center;

  .hamburger-container {
    margin-right: 15px; /* 和面包屑分开 */
    font-size: 24px;
    cursor: pointer;
  }

  .breadcrumb {
    font-size: 14px;
    color: #606266;

    .breadcrumb-icon {
      margin-right: 4px;
      font-size: 16px;
      vertical-align: middle;
    }

    .breadcrumb-title {
      margin-left: 2px;
    }
  }
}

/* 右边区域 */
.right-menu {
  .avatar-wrapper {
    display: flex;
    align-items: center;
    cursor: pointer;

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
    }

    .el-icon--right {
      margin-left: 5px;
    }
  }
}
</style>
