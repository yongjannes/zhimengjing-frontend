<script setup>
import { useRouter } from "vue-router";
import { useSettingStore } from "@/store/modules/setting";
import MenuItem from "./MenuItem.vue";

const router = useRouter();
const settingStore = useSettingStore();

const menuRoutes = router.options.routes.find((route) => route.path === "/")?.children || [];
</script>

<template>
  <div>
    <div class="logo-container">
      <img src="/meng.svg" class="logo" alt="Logo" />
      <h1 v-if="!settingStore.isCollapse" class="title">织梦境</h1>
    </div>
    <el-menu
      active-text-color="#ffd04b"
      background-color="#304156"
      class="el-menu-vertical"
      :default-active="$route.path"
      text-color="#fff"
      router
      :collapse="settingStore.isCollapse"
    >
      <MenuItem :menuList="menuRoutes" />
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
/* 侧边栏容器 */
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0f172a;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.25);
  transition: width 0.3s ease;
}

/* Logo 区域 */
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  padding: 0 12px;
  cursor: pointer;
  background: linear-gradient(90deg, #4f83cc, #79a9f0);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);

  .logo {
    width: 36px;
    height: 36px;
    margin-right: 10px;
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
    transition: all 0.3s ease;
  }

  .logo:hover {
    transform: rotate(15deg) scale(1.1);
  }

  .title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    background: linear-gradient(90deg, #fff, #93c5fd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    transition: opacity 0.3s ease;
  }
}

/* 菜单整体 */
.el-menu {
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(180deg, #4f83cc, #79a9f0);
  border-right: none;
  transition: width 0.3s ease;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.el-menu:not(.el-menu--collapse) {
  width: 220px;
}

.el-menu--collapse {
  width: 74px;
}

/* 一级菜单项样式 */
.el-menu-item {
  display: flex;
  align-items: center;
  padding: 0 12px;
  margin: 6px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    color: #fff !important;
    background-color: rgba(59, 130, 246, 0.25) !important;
    transform: scale(1.05);
  }

  &.is-active {
    color: #fff !important;
    background: linear-gradient(90deg, #3b82f6, #22c55e);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .el-icon {
    margin-right: 8px;
    font-size: 20px;
    color: #93c5fd;
    transition: color 0.3s ease;
  }

  &.is-active .el-icon {
    color: #fff;
  }

  span {
    transition: opacity 0.3s ease;
  }
}

/* 二级菜单容器 */
.el-sub-menu {
  .el-sub-menu__title {
    display: flex;
    align-items: center;
    padding: 0 12px;
    margin: 6px 12px;
    color: #fff;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(59, 130, 246, 0.25);
      transform: scale(1.03);
    }

    .el-icon {
      margin-right: 8px;
      font-size: 18px;
      color: #93c5fd;
      transition: color 0.3s ease;
    }
  }

  &.is-active > .el-sub-menu__title {
    color: #fff;
    background: linear-gradient(90deg, #3b82f6, #22c55e);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);

    .el-icon {
      color: #fff;
    }
  }

  /* 二级菜单展开项 */
  .el-menu-item {
    padding: 6px 12px;
    margin: 4px 0 4px 24px; // 二级菜单缩进
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    transition: all 0.3s ease;

    &:hover {
      color: #fff !important;
      background-color: rgba(59, 130, 246, 0.2);
      transform: scale(1.02);
    }

    &.is-active {
      color: #fff !important;
      background: linear-gradient(90deg, #3b82f6, #22c55e);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }
  }
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
