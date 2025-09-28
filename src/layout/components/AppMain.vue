<script setup></script>

<template>
  <section class="app-main">
    <router-view />
  </section>
</template>

<style scoped>
.app-main {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 60px);
  padding: 20px;
  overflow: hidden;
  background-color: #f0f2f5;
}
</style>
