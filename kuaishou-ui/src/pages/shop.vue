<template>
  <v-container class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="mb-6 pa-6" variant="outlined">
          <v-card-title class="text-h6 font-weight-bold mb-4">
            小店
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
                <v-img :src="accountInfo.userInfo.userImage" cover />
              </v-avatar>
              <div class="text-h5 font-weight-bold">{{ accountInfo.userInfo.userNick }}</div>
              <div class="text-caption text-medium-emphasis mt-1">
                ID: {{ accountInfo.userInfo.userId }}
              </div>
              <div v-if="accountInfo.userInfo.kwaiId" class="text-caption text-medium-emphasis">
                快手号: {{ accountInfo.userInfo.kwaiId }}
              </div>
            </div>

            <v-divider class="mb-4" />

            <!-- 状态标签 -->
            <div class="d-flex justify-center gap-2 mb-6 flex-wrap">
              <v-chip
                :color="accountInfo.userInfo.overseaShop ? 'success' : 'grey'"
                variant="flat"
                size="small"
              >
                <v-icon start size="14">mdi-earth</v-icon>
                {{ accountInfo.userInfo.overseaShop ? '海外店' : '国内店' }}
              </v-chip>
              <v-chip
                :color="accountInfo.userInfo.staffAccount ? 'success' : 'grey'"
                variant="flat"
                size="small"
              >
                <v-icon start size="14">mdi-account-tie</v-icon>
                {{ accountInfo.userInfo.staffAccount ? '员工号' : '主账号' }}
              </v-chip>
              <v-chip
                v-if="accountInfo.userInfo.supplierTypeName"
                color="primary"
                variant="flat"
                size="small"
              >
                <v-icon start size="14">mdi-tag</v-icon>
                {{ accountInfo.userInfo.supplierTypeName }}
              </v-chip>
            </div>

            <!-- 权限能力 -->
            <div class="text-subtitle-2 font-weight-bold mb-3">CPS 权限</div>
            <v-row dense>
              <v-col v-for="(label, key) in abilityMap" :key="key" cols="6" sm="4">
                <v-card
                  variant="tonal"
                  class="pa-3 text-center"
                  :color="accountInfo.cpsRoleEntrance[key] ? 'success' : 'grey-lighten-2'"
                >
                  <v-icon
                    size="20"
                    :color="accountInfo.cpsRoleEntrance[key] ? 'success' : 'grey'"
                    class="mb-1"
                  >
                    {{ accountInfo.cpsRoleEntrance[key] ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                  <div
                    class="text-caption font-weight-medium"
                    :class="accountInfo.cpsRoleEntrance[key] ? 'text-success' : 'text-grey'"
                  >
                    {{ label }}
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

interface UserInfo {
  userId: number
  mainAccountId: number
  kwaiId: string
  userNick: string
  userImage: string
  overseaShop: boolean
  staffAccount: boolean
  supplierTypeId: number
  supplierTypeName: string
  supplierTypeOffline: boolean
  resources: any[]
}

interface CpsRoleEntrance {
  cpsAbility: boolean
  investmentPromotionAbility: boolean
  distributeSellerAbility: boolean
  promotionAbility: boolean
  kwaiMoneyAbility: boolean
  cpsExternalPromotionAbility: boolean
  promoterSquareAbility: boolean
  openKwaiMoneyAbility: boolean
  baseServiceAbility: boolean
}

interface AccountInfo {
  userInfo: UserInfo
  cpsRoleEntrance: CpsRoleEntrance
}

const abilityMap: Record<keyof CpsRoleEntrance, string> = {
  cpsAbility: 'CPS',
  investmentPromotionAbility: '招商',
  distributeSellerAbility: '分销卖家',
  promotionAbility: '推广',
  kwaiMoneyAbility: '快钱',
  cpsExternalPromotionAbility: '站外推广',
  promoterSquareAbility: '推广广场',
  openKwaiMoneyAbility: '快钱开通',
  baseServiceAbility: '基础服务',
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
      'https://cps.kwaixiaodian.com/gateway/distribute/match/user/basic/login/info?type=1',
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
      errorMsg.value = res.data.errorMsg || res.data.error_msg || `请求失败: result=${res.data.result}`
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
