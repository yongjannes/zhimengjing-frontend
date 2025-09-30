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
      <!--      <Footer />-->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar-container {
  position: fixed; /* 1. 改为固定定位，脱离文档流 */
  top: 0;
  left: 0;
  z-index: 1001;
  width: 210px !important;
  height: 100%; /* 确保高度撑满 */
  overflow: hidden;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  transition: width 0.28s;
}

/* 主内容区样式 */
.main-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-left: 210px; /* 2. 添加默认的左边距，为展开的侧边栏留出空间 */
  transition: margin-left 0.28s;
}

.main-container > .footer {
  flex-shrink: 0;
  height: 30px;
  background: #f0f0f0;
}

/* 当侧边栏收缩时应用的样式 */
.sidebar-collapse {
  .sidebar-container {
    width: 64px !important;
  }
  .main-container {
    margin-left: 64px; /* 3. 这条规则现在可以正确地覆盖默认边距 */
  }
}
</style>
