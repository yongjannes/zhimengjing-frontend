<template>
  <footer class="footer">
    Copyright © 2025 zhimengjing. All rights reserved.
    <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer"> ICP备案号 </a>
  </footer>
</template>

<script setup></script>

<style lang="scss" scoped>
.footer {
  display: flex;
  /* 防止页脚在 flex 布局中被压缩 */
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 50px;
  padding: 0 20px;
  font-size: 14px;
  color: #8a8a8a;
  background-color: #f7f7f7;
  border-top: 1px solid #e6e6e6;
}

.footer a {
  margin-left: 10px;
  color: #8a8a8a;
  text-decoration: none;
  transition: color 0.3s;

  &:hover {
    color: #333;
  }
}
</style>
