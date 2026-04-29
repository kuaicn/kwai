<template>
  <div class="browser-check-overlay">
    请使用专用浏览器访问
  </div>
</template>

<script lang="ts" setup>
//
</script>

<style scoped>
.browser-check-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  z-index: 99999;
}
</style>
