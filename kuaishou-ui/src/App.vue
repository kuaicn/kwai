<template>
  <v-app>
    <v-app-bar density="compact" color="surface">
      <v-tabs v-model="tab" align-tabs="center">
        <v-tab to="/">首页</v-tab>
        <v-tab to="/mcn">电商MCN</v-tab>
        <v-tab to="/guild">娱乐公会</v-tab>
        <v-tab to="/agency">公会机构</v-tab>
        <v-tab to="/service">电商服务商</v-tab>
        <v-tab to="/live-app">直播（App）</v-tab>
        <v-tab to="/live-web">直播（Web）</v-tab>
      </v-tabs>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const tab = ref(null)
</script>
