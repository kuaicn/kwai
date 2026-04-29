<template>
  <div class="browser-check-overlay">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>
    <div class="bg-orb orb-4"></div>
    <div class="glass-card">
      <i class="mdi mdi-lock icon"></i>
      <div class="text">请使用专用浏览器访问</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import '@mdi/font/css/materialdesignicons.css'
</script>

<style scoped>
.browser-check-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  background-size: 400% 400%;
  animation: gradientFlow 15s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  overflow: hidden;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: orbFloat 20s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #ff00cc, transparent 70%);
  top: -10%;
  left: -10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #3333ff, transparent 70%);
  bottom: -15%;
  right: -10%;
  animation-delay: -5s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #00ffcc, transparent 70%);
  top: 40%;
  left: 60%;
  animation-delay: -10s;
}

.orb-4 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #ff6600, transparent 70%);
  top: 60%;
  left: 20%;
  animation-delay: -15s;
}

@keyframes orbFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(50px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-30px, 50px) scale(0.95);
  }
  75% {
    transform: translate(20px, 20px) scale(1.05);
  }
}

.glass-card {
  position: relative;
  z-index: 1;
  padding: 48px 64px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  text-align: center;
}

.icon {
  font-size: 56px;
  margin-bottom: 16px;
  animation: iconShake 2s ease-in-out infinite;
}

@keyframes iconShake {
  0%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(-10deg); }
  20% { transform: rotate(10deg); }
  30% { transform: rotate(-10deg); }
  40% { transform: rotate(10deg); }
  50% { transform: rotate(0deg); }
}

.text {
  color: #fff;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 2px;
}
</style>
