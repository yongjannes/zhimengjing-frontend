<script setup>
import { useTabsStore } from "@/store/modules/tabs";
import { useRoute, useRouter } from "vue-router";

const store = useTabsStore();
const route = useRoute();
const router = useRouter();

// --- 右键菜单相关 ---
const menuVisible = ref(false);
const menuStyle = ref({
  left: "0px",
  top: "0px",
});
const rightClickedTabPath = ref("");

// 打开右键菜单
const openMenu = (e, path) => {
  // 只有非首页标签才显示菜单
  if (path !== "/home") {
    menuVisible.value = true;
    menuStyle.value.left = e.clientX + "px";
    menuStyle.value.top = e.clientY + "px";
    rightClickedTabPath.value = path;
  }
};

// 关闭右键菜单
const closeMenu = () => {
  menuVisible.value = false;
};

// 监听菜单可见性，用于添加/移除全局点击事件
watch(
  () => menuVisible.value,
  (visible) => {
    if (visible) {
      document.body.addEventListener("click", closeMenu);
    } else {
      document.body.removeEventListener("click", closeMenu);
    }
  },
);

// 右键菜单操作：关闭当前
const handleCloseCurrent = () => {
  removeTab(rightClickedTabPath.value);
};

// 右键菜单操作：关闭其他
const handleCloseOthers = () => {
  store.closeOtherTabs(rightClickedTabPath.value);
  if (route.path !== rightClickedTabPath.value) {
    router.push(rightClickedTabPath.value);
  }
};

// 右键菜单操作：关闭所有
const handleCloseAll = () => {
  store.closeAllTabs();
  if (route.path !== "/home") {
    router.push("/home");
  }
};
// --- 右键菜单相关结束 ---

const addTab = () => {
  if (route.meta.title) {
    store.addTab({
      path: route.path,
      title: route.meta.title,
    });
  }
};

const removeTab = (targetPath) => {
  if (targetPath === "/home") return;

  const tabsList = store.tabs;
  let newActivePath = store.activeTab;

  if (targetPath === store.activeTab) {
    const currentIndex = tabsList.findIndex((tab) => tab.path === targetPath);
    const nextTab = tabsList[currentIndex - 1] || tabsList[currentIndex + 1];
    if (nextTab) {
      newActivePath = nextTab.path;
    }
  }

  store.removeTab(targetPath);

  if (newActivePath !== route.path) {
    router.push(newActivePath).then(() => {
      store.setActiveTab(newActivePath);
    });
  }
};

const clickTab = (pane) => {
  router.push(pane.props.name);
  store.setActiveTab(pane.props.name);
};

watch(
  () => route.path,
  () => {
    addTab();
  },
  { immediate: true },
);
</script>

<template>
  <div class="tabs-container">
    <el-tabs
      v-model="store.activeTab"
      type="card"
      class="demo-tabs"
      closable
      @tab-remove="removeTab"
      @tab-click="clickTab"
    >
      <el-tab-pane
        v-for="item in store.tabs"
        :key="item.path"
        :name="item.path"
        :closable="item.closable"
      >
        <template #label>
          <span @contextmenu.prevent="openMenu($event, item.path)">
            {{ item.title }}
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <ul v-if="menuVisible" class="context-menu" :style="menuStyle">
      <li @click="handleCloseCurrent">关闭当前</li>
      <li @click="handleCloseOthers">关闭其他</li>
      <li @click="handleCloseAll">关闭所有</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.tabs-container {
  position: sticky; // 新增：粘性定位
  top: 60px; // 新增：粘在Navbar下方（60px是Navbar高度）
  z-index: 99; // 新增：比Navbar略低
  flex-shrink: 0; // 新增：不允许收缩
  padding: 12px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  :deep(.el-tabs--card > .el-tabs__header) {
    margin: 0;
    border: none;
  }

  :deep(.el-tabs__nav) {
    overflow: hidden;
    border: none !important;
    border-radius: 8px;
  }

  :deep(.el-tabs__item) {
    height: 36px;
    padding: 0 16px !important;
    margin: 0 4px;
    font-size: 14px;
    font-weight: 500;
    line-height: 36px;
    color: #6c757d;
    background-color: #ffffff;
    border: none !important;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      color: #495057;
      background-color: #f1f3f5;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }

    &.is-active {
      font-weight: 600;
      color: #ffffff;
      background-color: var(--el-color-primary);
      box-shadow: 0 2px 5px rgba(67, 97, 238, 0.3);

      &:hover {
        background-color: var(--el-color-primary);
        filter: brightness(0.95);
      }
    }

    .el-icon-close {
      margin-left: 8px;
      transition: all 0.2s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        transform: rotate(90deg);
      }
    }
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__active-bar) {
    display: none;
  }
}
/* 新增：右键菜单样式 */
.context-menu {
  position: fixed;
  z-index: 3000;
  padding: 8px 0;
  list-style-type: none;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  li {
    padding: 8px 16px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      color: var(--el-color-primary);
      background-color: #f5f7fa;
    }
  }
}
</style>
