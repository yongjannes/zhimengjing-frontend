import { defineStore } from "pinia";

export const useSettingStore = defineStore(
  "setting",
  () => {
    // 定义一个 ref 变量来追踪侧边栏是否折叠
    // false 代表不折叠 (展开)
    const isCollapse = ref(false);

    // 定义一个 action 函数来切换折叠状态
    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value;
    };

    return {
      isCollapse,
      toggleCollapse,
    };
  },
  {
    persist: {
      key: "settingStore",
      paths: ["isCollapse"], // 持久化保存 isCollapse 状态
    },
  },
);
