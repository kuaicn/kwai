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

        <!-- 预计结算日历 -->
        <v-card v-if="selectedAccount" variant="outlined" class="mt-4 pa-4">
          <v-card-title class="text-h6 font-weight-bold mb-2 d-flex align-center justify-space-between flex-wrap">
            <span>预计结算日历</span>
            <div class="d-flex align-center gap-2">
              <v-btn icon="mdi-chevron-left" variant="text" density="compact" @click="prevMonth" />
              <span class="text-body-1 font-weight-medium">{{ calendarYear }}年{{ calendarMonth + 1 }}月</span>
              <v-btn icon="mdi-chevron-right" variant="text" density="compact" @click="nextMonth" />
            </div>
          </v-card-title>

          <v-card-text>
            <v-progress-linear v-if="loadingCalendar" indeterminate class="mb-2" />

            <!-- 星期标题 -->
            <div class="calendar-grid mb-1">
              <div
                v-for="d in weekdays"
                :key="d"
                class="text-caption text-center font-weight-medium text-medium-emphasis py-1"
              >
                {{ d }}
              </div>
            </div>

            <!-- 日期网格 -->
            <div class="calendar-grid">
              <div
                v-for="(day, idx) in calendarDays"
                :key="idx"
                class="calendar-day pa-1"
                :class="{ 'has-data': day.data }"
              >
                <template v-if="day.date > 0">
                  <div class="text-caption font-weight-medium text-right">{{ day.date }}</div>
                  <div v-if="day.data" class="mt-1">
                    <div class="text-caption text-success">结{{ day.data.settlement.toFixed(2) }}</div>
                    <div class="text-caption text-primary">收{{ day.data.income.toFixed(2) }}</div>
                    <div class="text-caption text-error">支{{ day.data.outgoing.toFixed(2) }}</div>
                  </div>
                </template>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- 软电话 -->
        <v-card v-if="selectedAccount" variant="outlined" class="mt-4 pa-4">
          <v-card-title class="text-h6 font-weight-bold mb-2 d-flex align-center justify-space-between">
            <span>软电话</span>
            <v-chip v-if="softPhoneLoggedIn" :color="softPhoneColor" size="small" variant="flat">
              {{ softPhoneStatusText }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div class="d-flex gap-2 flex-wrap mb-3">
              <v-btn
                v-if="!softPhoneLoggedIn"
                color="primary"
                :loading="softPhoneLoading"
                prepend-icon="mdi-phone"
                @click="loginSoftPhone"
              >
                登录软电话
              </v-btn>

              <template v-else>
                <v-btn
                  color="error"
                  variant="outlined"
                  prepend-icon="mdi-phone-hangup"
                  :disabled="!canHangup"
                  @click="hangupCall"
                >
                  挂断
                </v-btn>
                <v-btn
                  color="warning"
                  variant="outlined"
                  prepend-icon="mdi-pause-circle"
                  :disabled="!canPause"
                  @click="pauseAgent"
                >
                  置忙
                </v-btn>
                <v-btn
                  color="info"
                  variant="outlined"
                  prepend-icon="mdi-play-circle"
                  :disabled="!canUnpause"
                  @click="unpauseAgent"
                >
                  置闲
                </v-btn>
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-logout"
                  :disabled="!canLogout"
                  @click="logoutSoftPhone"
                >
                  登出
                </v-btn>
              </template>
            </div>

            <div v-if="softPhoneLoggedIn" class="mb-3">
              <v-row dense>
                <v-col cols="8">
                  <v-text-field
                    v-model="outcallNumber"
                    label="外呼号码"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @keyup.enter="makeOutcall"
                  />
                </v-col>
                <v-col cols="4">
                  <v-btn
                    color="success"
                    block
                    height="40"
                    :disabled="!canCall"
                    @click="makeOutcall"
                  >
                    <v-icon start>mdi-phone-outgoing</v-icon>
                    呼叫
                  </v-btn>
                </v-col>
              </v-row>
            </div>

              <v-divider class="mb-2" />
              <div class="text-caption text-medium-emphasis mb-1">事件日志</div>
              <div class="softphone-logs">
                <div v-for="(log, idx) in softPhoneLogs" :key="idx" class="text-caption py-1">
                  <span class="text-grey">{{ log.time }}</span>
                  <span class="ml-2">{{ log.message }}</span>
                </div>
                <div v-if="softPhoneLogs.length === 0" class="text-caption text-grey">暂无日志</div>
              </div>
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
import { fetchUnsettledBills, getOutcallLoginInfo } from '@/api/kuaixiaodian'
import { createClinkAgent, EVENT_TYPE, RESPONSE_TYPE, type TokenMessage } from '@/lib/clink-agent'

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

interface DayData {
  date: string
  settlement: number
  income: number
  outgoing: number
}

interface SoftPhoneLog {
  time: string
  message: string
}

const accounts = ref<Account[]>([])
const selectedAccount = ref<Account | null>(null)
const accountInfo = ref<AccountInfo | null>(null)
const errorMsg = ref<string | null>(null)

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const calendarYear = ref(new Date().getFullYear())
const calendarMonth = ref(new Date().getMonth())
const dayDataMap = ref<Map<string, DayData>>(new Map())
const loadingCalendar = ref(false)

const accountOptions = computed(() => {
  return accounts.value
    .filter(a => a.sid === 'kuaishou.shop.b')
    .map(a => ({
      id: a.id,
      label: `${a.userName} (${a.userId})`,
      ...a,
    }))
})

const calendarDays = computed(() => {
  const year = calendarYear.value
  const month = calendarMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startWeekday = firstDay.getDay()

  const days: { date: number; fullDate: string; data?: DayData }[] = []

  for (let i = 0; i < startWeekday; i++) {
    days.push({ date: 0, fullDate: '' })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ date: d, fullDate, data: dayDataMap.value.get(fullDate) })
  }

  return days
})

/* ---------- 软电话状态 ---------- */

const softPhoneLoggedIn = ref(false)
const softPhoneLoading = ref(false)
const softPhoneStatus = ref('')
const outcallNumber = ref('')
const softPhoneLogs = ref<SoftPhoneLog[]>([])
let softPhoneClient: any = null

const softPhoneStatusText = computed(() => {
  const map: Record<string, string> = {
    IDLE: '空闲',
    PAUSE: '忙碌',
    OFFLINE: '离线',
    WRAPUP: '整理中',
    BUSY: '通话中',
    CALLING: '呼叫中',
    RINGING: '响铃中',
  }
  return map[softPhoneStatus.value] || softPhoneStatus.value
})

const softPhoneColor = computed(() => {
  const map: Record<string, string> = {
    IDLE: 'success',
    PAUSE: 'warning',
    OFFLINE: 'grey',
    BUSY: 'error',
    WRAPUP: 'primary',
    CALLING: 'info',
    RINGING: 'deep-purple',
  }
  return map[softPhoneStatus.value] || 'primary'
})

const canCall = computed(() => softPhoneLoggedIn.value && softPhoneStatus.value === 'IDLE' && outcallNumber.value.trim().length > 0)
const canHangup = computed(() => softPhoneLoggedIn.value && ['BUSY', 'RINGING', 'CALLING'].includes(softPhoneStatus.value))
const canPause = computed(() => softPhoneLoggedIn.value && softPhoneStatus.value === 'IDLE')
const canUnpause = computed(() => softPhoneLoggedIn.value && softPhoneStatus.value === 'PAUSE')
const canLogout = computed(() => softPhoneLoggedIn.value)

function addSoftPhoneLog(message: string) {
  const now = new Date().toLocaleTimeString()
  softPhoneLogs.value.unshift({ time: now, message })
  if (softPhoneLogs.value.length > 20) {
    softPhoneLogs.value.pop()
  }
}

async function loginSoftPhone() {
  if (!selectedAccount.value) return
  softPhoneLoading.value = true
  errorMsg.value = null

  try {
    const res: any = await getOutcallLoginInfo(
      {
        receiverId: 666666,
        callerName: '',
        businessId: 26000,
        role: 10,
        queues: ['1001'],
      },
      {
        userId: String(selectedAccount.value.userId),
        'kuaishou.shop.b_st': selectedAccount.value.apiSt,
      },
    )

    if (res.data.result === 109) {
      throw new Error('SESSION_EXPIRED')
    }
    if (res.data.result !== 1) {
      errorMsg.value = res.data.error_msg || '获取软电话登录信息失败'
      return
    }

    const loginInfo = res.data.data?.loginInfo
    if (!loginInfo) {
      errorMsg.value = '未获取到软电话登录信息'
      return
    }

    softPhoneClient = createClinkAgent(
      loginInfo.identifier,
      'https://ws-ksip-y.corp.kuaishou.com',
    )

    softPhoneClient.registerListener(EVENT_TYPE.STATUS, (token: TokenMessage) => {
      softPhoneStatus.value = token.code as string
      addSoftPhoneLog(`状态变更: ${token.code}`)
    })

    softPhoneClient.registerListener(EVENT_TYPE.SIP_REGISTERED, (token: TokenMessage) => {
      addSoftPhoneLog(`软电话注册: ${token.msg}`)
    })

    softPhoneClient.registerListener(EVENT_TYPE.RINGING, () => {
      addSoftPhoneLog('来电响铃')
    })

    softPhoneClient.registerListener(EVENT_TYPE.PREVIEW_OUTCALL_START, () => {
      addSoftPhoneLog('开始外呼')
    })

    softPhoneClient.registerListener(EVENT_TYPE.PREVIEW_OUTCALL_BRIDGE, () => {
      addSoftPhoneLog('外呼接通')
    })

    softPhoneClient.registerListener(EVENT_TYPE.KICKOUT, () => {
      addSoftPhoneLog('被踢下线')
      softPhoneLoggedIn.value = false
      softPhoneStatus.value = ''
    })

    softPhoneClient.registerListener(EVENT_TYPE.BREAK_LINE, () => {
      addSoftPhoneLog('连接断开，正在重连...')
    })

    softPhoneClient.registerCallback(RESPONSE_TYPE.LOGIN, (token: TokenMessage) => {
      if (token.code === 0) {
        softPhoneLoggedIn.value = true
        addSoftPhoneLog('登录成功')
      } else {
        addSoftPhoneLog(`登录失败: ${JSON.stringify(token)}`)
      }
    })

    softPhoneClient.registerCallback(RESPONSE_TYPE.PAUSE, () => {
      addSoftPhoneLog('置忙成功')
    })

    softPhoneClient.registerCallback(RESPONSE_TYPE.UNPAUSE, () => {
      addSoftPhoneLog('置闲成功')
    })

    softPhoneClient.registerCallback(RESPONSE_TYPE.PREVIEW_OUTCALL, (token: TokenMessage) => {
      addSoftPhoneLog(`外呼响应: ${token.code}`)
    })

    softPhoneClient.setup(
      { debug: true, sipPhone: true, connectInterval: 1000 },
      () => {
        softPhoneClient.login({
          identifier: loginInfo.identifier,
          cno: loginInfo.agentId,
          password: loginInfo.password,
          loginStatus: 2,
          bindType: 3,
          bindTel: loginInfo.phoneNumber,
          pauseDescription: '忙碌',
        })
      },
    )
  } catch (err: any) {
    if (err.message === 'SESSION_EXPIRED') {
      const acc = selectedAccount.value
      if (acc.id !== undefined) {
        await deleteAccount(acc.id)
        await loadAccounts()
      }
      selectedAccount.value = null
      accountInfo.value = null
      softPhoneLoggedIn.value = false
      softPhoneStatus.value = ''
      errorMsg.value = `账户 ${acc.userName}（${acc.userId}）已失效，已自动移除`
      return
    }
    errorMsg.value = err.message || '软电话登录异常'
  } finally {
    softPhoneLoading.value = false
  }
}

function logoutSoftPhone() {
  if (softPhoneClient) {
    softPhoneClient.logout({ logoutMode: 1, chatClose: 1 })
    softPhoneClient = null
  }
  softPhoneLoggedIn.value = false
  softPhoneStatus.value = ''
  softPhoneLogs.value = []
}

function makeOutcall() {
  if (!softPhoneClient || !outcallNumber.value) return
  softPhoneClient.previewOutcall({ tel: outcallNumber.value })
  addSoftPhoneLog(`发起外呼: ${outcallNumber.value}`)
}

function hangupCall() {
  if (!softPhoneClient) return
  softPhoneClient.unlink()
  addSoftPhoneLog('挂断')
}

function pauseAgent() {
  if (!softPhoneClient) return
  softPhoneClient.pause({ pauseType: 1, pauseDescription: '置忙' })
  addSoftPhoneLog('置忙')
}

function unpauseAgent() {
  if (!softPhoneClient) return
  softPhoneClient.unpause()
  addSoftPhoneLog('置闲')
}

/* ---------- 原有方法 ---------- */

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

async function loadCalendarData() {
  if (!selectedAccount.value) return
  loadingCalendar.value = true

  const year = calendarYear.value
  const month = calendarMonth.value
  const start = new Date(year, month, 1).getTime()
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime()

  try {
    const records = await fetchUnsettledBills(
      {
        userId: String(selectedAccount.value.userId),
        'kuaishou.shop.b_st': selectedAccount.value.apiSt,
      },
      start,
      end,
    )

    const map = new Map<string, DayData>()
    for (const r of records) {
      const date = new Date(r.orderCreateTime)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      if (!map.has(key)) {
        map.set(key, { date: key, settlement: 0, income: 0, outgoing: 0 })
      }
      const d = map.get(key)!
      d.settlement += parseFloat(r.settlementAmount || '0')
      d.income += parseFloat(r.totalIncomeAmount || '0')
      d.outgoing += parseFloat(r.totalOutgoingAmount || '0')
    }
    dayDataMap.value = map
  } catch (err: any) {
    if (err.message === 'SESSION_EXPIRED') {
      const acc = selectedAccount.value
      if (acc.id !== undefined) {
        await deleteAccount(acc.id)
        await loadAccounts()
      }
      selectedAccount.value = null
      accountInfo.value = null
      errorMsg.value = `账户 ${acc.userName}（${acc.userId}）已失效，已自动移除`
      return
    }
    errorMsg.value = err.message || '加载账单数据失败'
  } finally {
    loadingCalendar.value = false
  }
}

function prevMonth() {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
  loadCalendarData()
}

function nextMonth() {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
  loadCalendarData()
}

watch(selectedAccount, (val) => {
  if (val) {
    fetchAccountInfo()
    calendarYear.value = new Date().getFullYear()
    calendarMonth.value = new Date().getMonth()
    loadCalendarData()
  } else {
    accountInfo.value = null
    errorMsg.value = null
    dayDataMap.value = new Map()
    logoutSoftPhone()
  }
})

onMounted(() => {
  loadAccounts()
})
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  min-height: 80px;
  border-radius: 4px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  transition: background 0.2s;
}

.calendar-day.has-data {
  background: rgba(var(--v-theme-primary), 0.06);
}

.softphone-logs {
  max-height: 120px;
  overflow-y: auto;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 4px;
  padding: 8px;
}
</style>
