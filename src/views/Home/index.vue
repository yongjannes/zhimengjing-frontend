<script setup>
const open1 = () => {
  ElNotification({
    title: "Success",
    message: "This is a success message",
    type: "success",
  });
};
</script>
<template>
  <div>H1</div>
  <el-button class="!ml-0" plain @click="open1">Success</el-button>
</template>
