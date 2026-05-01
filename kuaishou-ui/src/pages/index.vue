<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <div class="text-center">
      <h1 class="text-h4 font-weight-bold mb-4">kuaicn</h1>
      <p class="text-body-1 text-medium-emphasis">{{ status }}</p>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { proxy } from '@/api/proxy'

const status = ref('Loading...')

onMounted(async () => {
  try {
    const res = await proxy.get(
      'https://cps.kwaixiaodian.com/gateway/distribute/match/user/basic/login/info?type=1',
      {
        originalHeaders: {
          Cookie:
            'did=web_wsn83te8m4yf53w62gljja1x35mggkkf; sid=kuaishou.shop.b; bUserId=1000600158574; userId=5434959379; kuaishou.shop.b_st=ChJrdWFpc2hvdS5zaG9wLmIuc3QSoAGvgwEwvAFYCtw9il6AzVhiCweC9SzDV2gu7bKT8Lr11IvJbYvFsgXihmW3bjjWPlSl4vmNwnDhihY5Fm7rhjwjdGW6LXzRyIEUZjw6qm8bqf5nGeG4X2rPK4l5K1lg-l2UKCP--rOr0XF75r9852-y7gghNuLUlu7UImQ5d19bw76Q3LaNwS7JFWo4IKB-3ud1GsU-6ygANiPjrCC0uQo1GhI6AjZAm21RFhrJYP79BslttNciIPxHFP7fFBKCKraGE0JgCoEhh6t5L5YJMsn40xQXeDarKAUwAQ; kuaishou.shop.b_ph=21f81941e4d563a96872665eff4a3b208cf8',
        },
        proxyOptions: {
          timings: true,
          timeout: 300000,
          rejectUnauthorized: false,
          followRedirect: true,
        },
      },
    )
    status.value = JSON.stringify(res.data)
  } catch (err: any) {
    status.value = err.message || 'Request failed'
  }
})
</script>
