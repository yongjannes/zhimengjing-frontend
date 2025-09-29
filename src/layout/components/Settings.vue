<script setup>
import { ref } from "vue";
import { useSettingStore } from "@/store/modules/setting";

const settingStore = useSettingStore();
const drawer = ref(false);
</script>
<template>
  <div>
    <div class="right-menu-item" @click="drawer = true">
      <el-icon>
        <i-ep-setting />
      </el-icon>
    </div>

    <el-drawer v-model="drawer" title="系统设置" size="300px">
      <el-divider>主题颜色</el-divider>
      <el-color-picker
        :model-value="settingStore.themeColor"
        @change="settingStore.setThemeColor"
      />
    </el-drawer>
  </div>
</template>
