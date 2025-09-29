<script setup>
import { watch, onMounted } from "vue";
import { useSettingStore } from "@/store/modules/setting";

const settingStore = useSettingStore();

// 监听主题颜色变化，并应用到全局
watch(
  () => settingStore.themeColor,
  (newColor) => {
    document.documentElement.style.setProperty("--el-color-primary", newColor);
  },
);
// 初始化时也应用一次，防止刷新后颜色不匹配
onMounted(() => {
  document.documentElement.style.setProperty("--el-color-primary", settingStore.themeColor);
  // 根据持久化的状态初始化暗黑模式
  if (settingStore.isDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
});
</script>

<template>
  <router-view />
</template>

<style scoped lang="scss"></style>
