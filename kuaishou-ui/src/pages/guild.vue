<template>
  <v-container class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="mb-6 pa-6" variant="outlined">
          <v-card-title class="text-h6 font-weight-bold mb-4">
            娱乐公会
          </v-card-title>

          <v-select
            v-model="selectedAccount"
            :items="accountOptions"
            item-title="label"
            item-value="id"
            label="选择账户"
            variant="outlined"
            class="mb-4"
            return-object
            clearable
          />
        </v-card>

        <v-alert
          v-if="errorMsg"
          type="error"
          :text="errorMsg"
          class="mb-4"
          closable
          @click:close="errorMsg = null"
        />

        <v-card v-if="guildInfo" variant="outlined" class="pa-4">
          <v-card-text>
            <!-- 用户基本信息 -->
            <div class="text-center mb-6">
              <v-avatar size="100" class="mb-3 elevation-2">
                <v-img :src="guildInfo.orgBasicInfo.userInfo.headUrl" cover />
              </v-avatar>
              <div class="text-h5 font-weight-bold">{{ guildInfo.orgBasicInfo.userInfo.userName }}</div>
              <div class="text-caption text-medium-emphasis mt-1">
                ID: {{ guildInfo.orgBasicInfo.userInfo.userId }}
              </div>
            </div>

            <v-divider class="mb-4" />

            <!-- 角色与公会 -->
            <div class="d-flex justify-center gap-2 mb-6 flex-wrap">
              <v-chip color="primary" variant="flat" size="small">
                <v-icon start size="14">mdi-badge-account</v-icon>
                {{ guildInfo.orgBasicInfo.brokerInfo.roleName }}
              </v-chip>
              <v-chip color="success" variant="flat" size="small">
                <v-icon start size="14">mdi-office-building</v-icon>
                {{ guildInfo.orgBasicInfo.orgInfo.orgShortName }}
              </v-chip>
              <v-chip color="info" variant="flat" size="small">
                <v-icon start size="14">mdi-tag</v-icon>
                类型 {{ guildInfo.orgBasicInfo.orgInfo.businessType }}
              </v-chip>
            </div>

            <!-- 公会信息卡片 -->
            <v-card variant="outlined" class="mb-4 pa-4">
              <div class="d-flex align-center">
                <v-avatar size="56" class="mr-4">
                  <v-img :src="guildInfo.orgBasicInfo.orgInfo.logo" cover />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">{{ guildInfo.orgBasicInfo.orgInfo.orgName }}</div>
                  <div class="text-caption text-medium-emphasis">Org ID: {{ guildInfo.orgBasicInfo.orgInfo.orgId }}</div>
                </div>
              </div>
            </v-card>

            <!-- 等级与特权 -->
            <v-row dense class="mb-4">
              <v-col cols="6" sm="4">
                <v-card variant="tonal" class="pa-3 text-center">
                  <div class="text-caption text-medium-emphasis">公会等级</div>
                  <div class="text-h6 font-weight-bold">Lv.{{ guildInfo.level.level }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="4">
                <v-card variant="tonal" class="pa-3 text-center">
                  <div class="text-caption text-medium-emphasis">特权数</div>
                  <div class="text-h6 font-weight-bold">{{ guildInfo.level.privilegeCount }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="4">
                <v-card variant="tonal" class="pa-3 text-center">
                  <div class="text-caption text-medium-emphasis">考核月份</div>
                  <div class="text-h6 font-weight-bold">{{ guildInfo.level.month }} 月</div>
                </v-card>
              </v-col>
            </v-row>

            <!-- 开关状态 -->
            <div class="text-subtitle-2 font-weight-bold mb-3">功能开关</div>
            <v-row dense>
              <v-col v-for="(item, key) in switches" :key="key" cols="6" sm="3">
                <v-card
                  variant="tonal"
                  class="pa-3 text-center"
                  :color="item.value ? 'success' : 'grey-lighten-2'"
                >
                  <v-icon
                    size="20"
                    :color="item.value ? 'success' : 'grey'"
                    class="mb-1"
                  >
                    {{ item.value ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                  <div
                    class="text-caption font-weight-medium"
                    :class="item.value ? 'text-success' : 'text-grey'"
                  >
                    {{ item.label }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getAccounts, deleteAccount, type Account } from '@/composables/useAccountDB'
import { proxy } from '@/api/proxy'

interface GuildInfo {
  orgBasicInfo: {
    userInfo: {
      userId: number
      userName: string
      userSex: string
      headUrl: string
      gender: number
    }
    brokerInfo: {
      orgId: number
      brokerId: number
      brokerRole: number
      roleName: string
      alias: string
    }
    orgInfo: {
      orgShortName: string
      orgName: string
      logo: string
      businessType: number
      orgId: number
    }
  }
  level: {
    privilegeCount: number
    month: number
    level: number
    showNew: boolean
  }
  activity: { show: boolean }
  miniProgram: { show: boolean }
  monitor: { enableMonitor: boolean }
  unionOp: { enableUnionOp: boolean }
  provinceAgent: { enableProvinceAgent: boolean }
  businessType: { type: number }
  settledStatus: { status: number }
  batchPlanConfig: { enableBatchCreate: boolean }
  liveStream: boolean
  [key: string]: any
}

const accounts = ref<Account[]>([])
const selectedAccount = ref<Account | null>(null)
const guildInfo = ref<GuildInfo | null>(null)
const errorMsg = ref<string | null>(null)

const accountOptions = computed(() => {
  return accounts.value
    .filter(a => a.sid === 'kuaishou.web.cp.api')
    .map(a => ({
      id: a.id,
      label: `${a.userName} (${a.userId})`,
      ...a,
    }))
})

const switches = computed(() => {
  if (!guildInfo.value) return []
  return [
    { label: '活动', value: guildInfo.value.activity?.show },
    { label: '小程序', value: guildInfo.value.miniProgram?.show },
    { label: '监控', value: guildInfo.value.monitor?.enableMonitor },
    { label: '联运', value: guildInfo.value.unionOp?.enableUnionOp },
    { label: '省代', value: guildInfo.value.provinceAgent?.enableProvinceAgent },
    { label: '直播流', value: guildInfo.value.liveStream },
    { label: '批量创建', value: guildInfo.value.batchPlanConfig?.enableBatchCreate },
    { label: '入驻', value: guildInfo.value.settledStatus?.status === 1 },
  ]
})

async function loadAccounts() {
  accounts.value = await getAccounts()
}

async function fetchGuildInfo() {
  if (!selectedAccount.value) return
  const acc = selectedAccount.value
  errorMsg.value = null
  guildInfo.value = null

  try {
    const res = await proxy.post(
      'https://666.kuaishou.com/rest/live/mcn/config/startup',
      null,
      {
        originalHeaders: {
          Cookie: `userId=${acc.userId}; kuaishou.web.cp.api_st=${acc.apiSt}`,
        },
        proxyOptions: {
          timings: true,
          timeout: 70000,
          rejectUnauthorized: false,
          followRedirect: true,
        },
      },
    )

    if (res.data.result === 109) {
      if (acc.id !== undefined) {
        await deleteAccount(acc.id)
        await loadAccounts()
      }
      selectedAccount.value = null
      errorMsg.value = `账户 ${acc.userName}（${acc.userId}）已失效，已自动移除`
      return
    }

    if (res.data.result === 1 && res.data.data) {
      guildInfo.value = res.data.data
    } else {
      errorMsg.value = res.data.message || `请求失败: result=${res.data.result}`
    }
  } catch (err: any) {
    errorMsg.value = err.message || '请求异常'
  }
}

watch(selectedAccount, (val) => {
  if (val) {
    fetchGuildInfo()
  } else {
    guildInfo.value = null
    errorMsg.value = null
  }
})

onMounted(() => {
  loadAccounts()
})
</script>
