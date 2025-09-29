import { defineStore } from "pinia";

export const useTabsStore = defineStore("tabs", {
  state: () => ({
    tabs: [{ title: "首页", path: "/home", closable: false }],
    activeTab: "/home",
  }),
  actions: {
    addTab(tab) {
      if (this.tabs.some((item) => item.path === tab.path)) {
        this.activeTab = tab.path;
        return;
      }
      this.tabs.push({ ...tab, closable: true });
      this.activeTab = tab.path;
    },
    removeTab(path) {
      const index = this.tabs.findIndex((item) => item.path === path);
      if (index !== -1) {
        this.tabs.splice(index, 1);
      }
    },
    setActiveTab(path) {
      this.activeTab = path;
    },
  },
  persist: {
    key: "tabsStore",
    paths: ["tabs", "activeTab"],
  },
});
