<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
    <BrowserCheckOverlay v-if="showBrowserWarning" />
  </v-app>
</template>

<script lang="ts" setup>
import BrowserCheckOverlay from '@/components/BrowserCheckOverlay.vue'
import { showBrowserWarning } from '@/composables/useBrowserCheck'
</script>
