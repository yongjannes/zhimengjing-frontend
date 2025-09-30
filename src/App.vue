<script setup>
import { watch } from "vue";
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
import Footer from "@/layout/components/Footer.vue";
</script>

<template>
  <router-view />
  <Footer />
</template>

<style scoped lang="scss"></style>
