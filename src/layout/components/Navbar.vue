<script setup>
import { useSettingStore } from "@/store/modules/setting";
const settingStore = useSettingStore();
</script>

<template>
  <div class="navbar">
    <div class="hamburger-container" @click="settingStore.toggleCollapse">
      <el-icon>
        <i-ep-expand v-if="settingStore.isCollapse" />
        <i-ep-fold v-else />
      </el-icon>
    </div>

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
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.hamburger-container {
  font-size: 24px;
  cursor: pointer;
}

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
