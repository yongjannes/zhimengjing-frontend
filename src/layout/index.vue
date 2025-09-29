<script setup>
import Sidebar from "./components/Sidebar.vue";
import Navbar from "./components/Navbar.vue";
import AppMain from "./components/AppMain.vue";
import Tabs from "./components/Tabs.vue";

import { useSettingStore } from "@/store/modules/setting";

const settingStore = useSettingStore();
</script>

<template>
  <div class="app-wrapper" :class="{ 'sidebar-collapse': settingStore.isCollapse }">
    <Sidebar class="sidebar-container" />

    <div class="main-container">
      <Navbar />
      <Tabs />
      <AppMain />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  display: flex;
  width: 100%;
  height: 100vh;
}

/* 侧边栏样式 - 基本不变，但高度由flex自动管理 */
.sidebar-container {
  z-index: 1001;
  // 防止侧边栏被压缩
  flex-shrink: 0;
  width: 210px !important;
  overflow: hidden;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  transition: width 0.28s;
}

/* 主内容区样式 - 核心修改区 */
.main-container {

  display: flex;
  flex: 1;
  flex-direction: column;

  //防止整个 main-container 滚动
  overflow: hidden;
  transition: margin-left 0.28s;
}

/* stylelint-disable selector-type-no-unknown */
.main-container > AppMain {
  flex: 1;
  // 允许内容滚动
  overflow-y: auto;
  // 可以加个平滑滚动
  scroll-behavior: smooth;
}

.sidebar-collapse {
  .sidebar-container {
    width: 64px !important;
  }
  .main-container {
    margin-left: 64px;
  }
}
</style>
