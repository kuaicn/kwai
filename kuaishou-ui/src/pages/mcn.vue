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

          <v-btn
            :disabled="!selectedAccount"
            color="primary"
            block
            @click="fetchAccountInfo"
          >
            获取账户信息
          </v-btn>
        </v-card>

        <v-alert
          v-if="errorMsg"
          type="error"
          :text="errorMsg"
          class="mb-4"
          closable
          @click:close="errorMsg = null"
        />

        <v-card v-if="accountInfo" variant="outlined">
          <v-card-title class="text-h6 font-weight-bold">
            账户详细信息
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12" sm="4" class="text-center">
                <v-avatar size="120" class="mb-2">
                  <v-img :src="accountInfo.userInfo.headImg" />
                </v-avatar>
                <div class="text-subtitle-1 font-weight-bold">{{ accountInfo.userInfo.name }}</div>
                <div class="text-caption text-medium-emphasis">userId: {{ accountInfo.userInfo.userId }}</div>
              </v-col>

              <v-col cols="12" sm="8">
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title>已入驻</v-list-item-title>
                    <v-list-item-subtitle>{{ accountInfo.existAccount ? '是' : '否' }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>已进入后台</v-list-item-title>
                    <v-list-item-subtitle>{{ accountInfo.haveEntered ? '是' : '否' }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>银行卡绑定</v-list-item-title>
                    <v-list-item-subtitle>{{ accountInfo.bankCardBindingStatus }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>ESP ID</v-list-item-title>
                    <v-list-item-subtitle>{{ accountInfo.espId }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>保证金状态</v-list-item-title>
                    <v-list-item-subtitle>{{ accountInfo.depositStatus }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>状态</v-list-item-title>
                    <v-list-item-subtitle>{{ accountInfo.status }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="accountInfo.espName">
                    <v-list-item-title>ESP 名称</v-list-item-title>
                    <v-list-item-subtitle>{{ accountInfo.espName }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
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

onMounted(() => {
  loadAccounts()
})
</script>
