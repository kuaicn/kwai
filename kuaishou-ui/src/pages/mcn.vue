<template>
  <v-container class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="mb-6 pa-6" variant="outlined">
          <v-card-title class="text-h6 font-weight-bold mb-4">
            电商MCN
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

        <v-card v-if="accountInfo" variant="outlined" class="pa-4">
          <v-card-text>
            <!-- 用户基本信息 -->
            <div class="text-center mb-6">
              <v-avatar size="100" class="mb-3 elevation-2">
                <v-img :src="accountInfo.userInfo.headImg" cover />
              </v-avatar>
              <div class="text-h5 font-weight-bold">{{ accountInfo.userInfo.name }}</div>
              <div class="text-caption text-medium-emphasis mt-1">
                ID: {{ accountInfo.userInfo.userId }}
              </div>
            </div>

            <v-divider class="mb-4" />

            <!-- 状态标签 -->
            <div class="d-flex justify-center gap-2 mb-6 flex-wrap">
              <v-chip
                :color="accountInfo.existAccount ? 'success' : 'grey'"
                variant="flat"
                size="small"
              >
                <v-icon start size="14">mdi-store</v-icon>
                {{ accountInfo.existAccount ? '已入驻' : '未入驻' }}
              </v-chip>
              <v-chip
                :color="accountInfo.haveEntered ? 'success' : 'grey'"
                variant="flat"
                size="small"
              >
                <v-icon start size="14">mdi-login</v-icon>
                {{ accountInfo.haveEntered ? '已进入' : '未进入' }}
              </v-chip>
              <v-chip
                :color="accountInfo.bankCardBindingStatus ? 'success' : 'warning'"
                variant="flat"
                size="small"
              >
                <v-icon start size="14">mdi-credit-card</v-icon>
                银行卡{{ accountInfo.bankCardBindingStatus ? '已绑' : '未绑' }}
              </v-chip>
            </div>

            <!-- 详细信息网格 -->
            <v-row dense>
              <v-col cols="6" sm="4">
                <v-card variant="tonal" class="pa-3 text-center">
                  <div class="text-caption text-medium-emphasis">ESP ID</div>
                  <div class="text-h6 font-weight-bold">{{ accountInfo.espId || '-' }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="4">
                <v-card variant="tonal" class="pa-3 text-center">
                  <div class="text-caption text-medium-emphasis">保证金</div>
                  <div class="text-h6 font-weight-bold">{{ accountInfo.depositStatus }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="4">
                <v-card variant="tonal" class="pa-3 text-center">
                  <div class="text-caption text-medium-emphasis">状态码</div>
                  <div class="text-h6 font-weight-bold">{{ accountInfo.status }}</div>
                </v-card>
              </v-col>
            </v-row>

            <!-- ESP 信息 -->
            <v-card v-if="accountInfo.espName" variant="outlined" class="mt-4 pa-4">
              <div class="d-flex align-center">
                <v-avatar size="48" class="mr-4">
                  <v-img :src="accountInfo.espLogo || ''" cover />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">{{ accountInfo.espName }}</div>
                  <div class="text-caption text-medium-emphasis">ESP 信息</div>
                </div>
              </div>
            </v-card>
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

interface AccountInfo {
  existAccount: boolean
  haveEntered: boolean
  userInfo: {
    headImg: string
    name: string
    userId: number
  }
  bankCardBindingStatus: number
  espId: number
  depositStatus: number
  status: number
  espName: string
  espLogo: string
}

const accounts = ref<Account[]>([])
const selectedAccount = ref<Account | null>(null)
const accountInfo = ref<AccountInfo | null>(null)
const errorMsg = ref<string | null>(null)

const accountOptions = computed(() => {
  return accounts.value
    .filter(a => a.sid === 'kuaishou.shop.b')
    .map(a => ({
      id: a.id,
      label: `${a.userName} (${a.userId})`,
      ...a,
    }))
})

async function loadAccounts() {
  accounts.value = await getAccounts()
}

async function fetchAccountInfo() {
  if (!selectedAccount.value) return
  const acc = selectedAccount.value
  errorMsg.value = null
  accountInfo.value = null

  try {
    const res = await proxy.get(
      'https://mcn.kwaixiaodian.com/rest/enrichment/esp/pc/account/info',
      {
        originalHeaders: {
          Cookie: `userId=${acc.userId}; kuaishou.shop.b_st=${acc.apiSt}`,
        },
        proxyOptions: {
          timings: true,
          timeout: 30000,
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
      accountInfo.value = res.data.data
    } else {
      errorMsg.value = res.data.errorMsg || `请求失败: result=${res.data.result}`
    }
  } catch (err: any) {
    errorMsg.value = err.message || '请求异常'
  }
}

watch(selectedAccount, (val) => {
  if (val) {
    fetchAccountInfo()
  } else {
    accountInfo.value = null
    errorMsg.value = null
  }
})

onMounted(() => {
  loadAccounts()
})
</script>
