<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/store/modules/user";

const userStore = useUserStore();
const open1 = () => {
  ElNotification({
    title: "Success",
    message: "This is a success message",
    type: "success",
  });
};
onMounted(() => {
  userStore.getInfo();
});
</script>
<template>
  <div>H1</div>
  <el-button class="!ml-0" plain @click="open1">Success</el-button>
</template>
