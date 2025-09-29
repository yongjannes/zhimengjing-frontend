<script setup>
import { useTabsStore } from "@/store/modules/tabs";
import { useRoute, useRouter } from "vue-router";
import { watch } from "vue";

const store = useTabsStore();
const route = useRoute();
const router = useRouter();

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

  // 如果关闭的是当前激活的标签页，则确定新的激活路径
  if (targetPath === store.activeTab) {
    const currentIndex = tabsList.findIndex((tab) => tab.path === targetPath);
    // 优先选择左边的标签页，否则选择右边的
    const nextTab = tabsList[currentIndex - 1] || tabsList[currentIndex + 1];
    if (nextTab) {
      newActivePath = nextTab.path;
    }
  }

  // 从 store 中移除标签页
  store.removeTab(targetPath);

  // 如果需要，切换到新的激活标签页
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
        :label="item.title"
        :name="item.path"
        :closable="item.closable"
      />
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.tabs-container {
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
      background-color: #4361ee;
      box-shadow: 0 2px 5px rgba(67, 97, 238, 0.3);

      &:hover {
        background-color: #3a56d4;
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
</style>
