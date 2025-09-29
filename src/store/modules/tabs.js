import { defineStore } from "pinia";
import { ref } from "vue";

export const useTabsStore = defineStore(
  "tabs",
  () => {
    const tabs = ref([{ title: "首页", path: "/home", closable: false }]);
    const activeTab = ref("/home");

    // 添加标签
    const addTab = (tab) => {
      if (tabs.value.some((item) => item.path === tab.path)) {
        activeTab.value = tab.path;
        return;
      }
      tabs.value.push({ ...tab, closable: true });
      activeTab.value = tab.path;
    };

    // 移除标签
    const removeTab = (path) => {
      const index = tabs.value.findIndex((item) => item.path === path);
      if (index !== -1) {
        tabs.value.splice(index, 1);
      }
    };

    // 设置激活标签
    const setActiveTab = (path) => {
      activeTab.value = path;
    };

    // 关闭其他标签
    const closeOtherTabs = (path) => {
      tabs.value = tabs.value.filter((item) => item.path === path || item.path === "/home");
      if (activeTab.value !== path) {
        activeTab.value = path;
      }
    };

    // 关闭全部标签
    const closeAllTabs = () => {
      tabs.value = [{ title: "首页", path: "/home", closable: false }];
      activeTab.value = "/home";
    };

    return {
      tabs,
      activeTab,
      addTab,
      removeTab,
      setActiveTab,
      closeOtherTabs,
      closeAllTabs,
    };
  },
  {
    persist: {
      key: "tabsStore",
      paths: ["tabs", "activeTab"],
    },
  },
);
