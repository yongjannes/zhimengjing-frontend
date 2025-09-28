<script setup>
import { useSettingStore } from "@/store/modules/setting";
const settingStore = useSettingStore();
</script>

<template>
  <div class="sidebar">
    <!-- Logo 区域 -->
    <div class="logo-container">
      <img src="/meng.svg" class="logo" alt="Logo" />
      <transition name="fade">
        <h1 v-if="!settingStore.isCollapse" class="title">织梦境</h1>
      </transition>
    </div>

    <!-- 菜单 -->
    <el-menu
      router
      active-text-color="#fff"
      class="el-menu-vertical"
      default-active="/"
      text-color="#cbd5e1"
      :collapse="settingStore.isCollapse"
    >
      <el-menu-item index="/">
        <el-icon><i-ep-HomeFilled /></el-icon>
        <span>首页</span>
      </el-menu-item>

      <el-menu-item index="/about">
        <el-icon><i-ep-InfoFilled /></el-icon>
        <span>关于我们</span>
      </el-menu-item>

      <el-menu-item index="/setting">
        <el-icon><i-ep-Setting /></el-icon>
        <span>系统设置</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
/* 整体侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0f172a;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.2);
}

/* Logo 区域 */
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  background: linear-gradient(90deg, #79a9f0, #a8c6ff);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .logo {
    width: 36px;
    height: 36px;
    margin-right: 8px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
    transition: all 0.3s ease;
  }
  .logo:hover {
    transform: rotate(10deg) scale(1.1);
  }

  .title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    background: linear-gradient(90deg, #fff, #93c5fd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

/* 菜单整体 */
.el-menu {
  flex: 1;
  overflow: hidden;
  background: linear-gradient(180deg, #4f83cc, #79a9f0);
  border-right: none;
  transition: width 0.3s ease;
}
.el-menu:not(.el-menu--collapse) {
  width: 220px;
}
.el-menu--collapse {
  width: 74px;
}

/* 菜单项美化 */
.el-menu-item {
  margin: 6px 10px;
  border-radius: 10px;
  transition: all 0.3s ease;
}
.el-menu-item.is-active {
  color: #fff !important;
  background: linear-gradient(90deg, #3b82f6, #22c55e);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}
.el-menu-item:hover {
  color: #fff !important;
  background-color: rgba(59, 130, 246, 0.2) !important;
  transform: scale(1.03);
}

/* 图标与文字对齐 */
.el-menu-item .el-icon {
  margin-right: 6px;
  font-size: 20px;
  color: #93c5fd;
}
.el-menu-item.is-active .el-icon {
  color: #fff;
}

/* Logo 出现动画 */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
