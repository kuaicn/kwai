<template>
  <v-app>
    <BrowserCheckOverlay v-if="showBrowserWarning" />
    <template v-else>
      <v-main>
        <router-view />
      </v-main>
    </template>
  </v-app>
</template>

<script lang="ts" setup>
import BrowserCheckOverlay from '@/components/BrowserCheckOverlay.vue'
import { showBrowserWarning } from '@/composables/useBrowserCheck'
</script>
