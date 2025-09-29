import { defineStore } from "pinia";

export const useSettingStore = defineStore(
  "setting",
  () => {
    // 定义一个 ref 变量来追踪侧边栏是否折叠
    // false 代表不折叠 (展开)
    const isCollapse = ref(false);
    // 主题颜色
    const themeColor = ref("#409EFF");

    // 定义一个 action 函数来切换折叠状态
    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value;
    };

    // 设置主题颜色
    const setThemeColor = (color) => {
      themeColor.value = color;
      document.documentElement.style.setProperty("--el-color-primary", color);
    };

    return {
      isCollapse,
      themeColor,
      toggleCollapse,
      setThemeColor,
    };
  },
  {
    persist: {
      key: "settingStore",
      paths: ["isCollapse", "themeColor"], // 持久化保存 isCollapse 状态
    },
  },
);
