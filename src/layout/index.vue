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
  width: 100%;
  height: 100%;
}

/* 侧边栏样式 */
.sidebar-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  width: 210px !important;
  height: 100%;
  overflow: hidden;
  background-color: #acc9ef;
  transition: width 0.28s;
}

/* 主内容区样式 */
.main-container {
  position: relative;
  min-height: 100%;
  margin-left: 210px; /* 留出左侧菜单的宽度 */
  transition: margin-left 0.28s;
}

.sidebar-collapse {
  /* 折叠时，侧边栏容器宽度变小 */
  .sidebar-container {
    width: 64px !important;
  }
  /* 折叠时，主内容区的左边距也变小 */
  .main-container {
    margin-left: 64px;
  }
}
</style>
