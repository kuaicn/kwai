<template>
  <v-container class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <!-- 扫码登录区域 -->
        <v-card class="mb-6 pa-6" variant="outlined">
          <v-card-title class="text-h6 font-weight-bold mb-4">
            扫码登录
          </v-card-title>

          <v-select
            v-model="selectedSid"
            :items="sidOptions"
            item-title="label"
            item-value="value"
            label="选择账号类型"
            variant="outlined"
            class="mb-4"
          />

          <v-btn
            :disabled="isScanning || !selectedSid"
            color="primary"
            block
            class="mb-4"
            @click="startScan"
          >
            {{ isScanning ? '登录中...' : '开始扫码登录' }}
          </v-btn>

          <v-alert
            v-if="scanStatus"
            :type="scanStatus.type"
            :text="scanStatus.text"
            class="mb-4"
            closable
            @click:close="scanStatus = null"
          />

          <div v-if="qrImageData" class="text-center">
            <v-img
              :src="`data:image/png;base64,${qrImageData}`"
              max-width="200"
              class="mx-auto mb-2"
            />
            <p class="text-caption text-medium-emphasis">请使用快手 App 扫码</p>
          </div>
        </v-card>

        <!-- 已保存账户列表 -->
        <v-card variant="outlined">
          <v-card-title class="text-h6 font-weight-bold d-flex align-center">
            已保存账户
            <v-spacer />
            <v-btn
              size="small"
              variant="text"
              color="error"
              @click="confirmClear = true"
            >
              全部删除
            </v-btn>
          </v-card-title>

          <v-card-text>
            <div v-if="Object.keys(groupedAccounts).length === 0" class="text-center py-8 text-medium-emphasis">
              暂无保存的账户
            </div>

            <div
              v-for="(accounts, sid) in groupedAccounts"
              :key="sid"
              class="mb-4"
            >
              <div class="text-subtitle-2 font-weight-bold text-primary mb-2">
                {{ sidLabel(sid) }}
              </div>

              <v-list density="compact">
                <v-list-item
                  v-for="acc in accounts"
                  :key="acc.id"
                  :prepend-avatar="acc.headurl || undefined"
                  :title="acc.userName"
                  :subtitle="`userId: ${acc.userId}`"
                >
                  <template #append>
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeAccount(acc.id!)"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 确认清空对话框 -->
    <v-dialog v-model="confirmClear" max-width="400">
      <v-card>
        <v-card-title>确认删除</v-card-title>
        <v-card-text>确定要删除所有保存的账户吗？</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmClear = false">取消</v-btn>
          <v-btn color="error" @click="clearAll">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { qrLogin } from '@/api/qrLogin'
import { addAccount, getAccounts, deleteAccount, clearAccounts, type Account } from '@/composables/useAccountDB'

interface ScanStatus {
  type: 'info' | 'success' | 'error'
  text: string
}

const sidOptions = [
  { label: '娱乐公会 + 公会机构 (kuaishou.web.cp.api)', value: 'kuaishou.web.cp.api' },
]

const selectedSid = ref('kuaishou.web.cp.api')
const isScanning = ref(false)
const scanStatus = ref<ScanStatus | null>(null)
const qrImageData = ref('')
const accountList = ref<Account[]>([])
const confirmClear = ref(false)

const groupedAccounts = computed(() => {
  const groups: Record<string, Account[]> = {}
  for (const acc of accountList.value) {
    if (!groups[acc.sid]) groups[acc.sid] = []
    groups[acc.sid].push(acc)
  }
  return groups
})

function sidLabel(sid: string): string {
  const opt = sidOptions.find(o => o.value === sid)
  return opt?.label || sid
}

async function loadAccounts() {
  accountList.value = await getAccounts()
}

async function startScan() {
  if (!selectedSid.value) return
  isScanning.value = true
  qrImageData.value = ''
  scanStatus.value = { type: 'info', text: '正在获取二维码...' }

  try {
    for await (const state of qrLogin(selectedSid.value)) {
      switch (state.stage) {
        case 'start':
          qrImageData.value = state.qrImageData || ''
          scanStatus.value = { type: 'info', text: '请使用快手 App 扫码' }
          break
        case 'scanning':
          scanStatus.value = { type: 'info', text: '等待扫码...' }
          break
        case 'scanned':
          scanStatus.value = { type: 'info', text: `已扫码: ${state.userInfo?.user_name || ''}，等待确认...` }
          break
        case 'accepting':
          scanStatus.value = { type: 'info', text: '等待确认登录...' }
          break
        case 'accepted':
          scanStatus.value = { type: 'info', text: '已确认，正在获取凭证...' }
          break
        case 'done':
          scanStatus.value = { type: 'success', text: '登录成功' }
          if (state.credentials && state.userInfo) {
            await addAccount({
              sid: selectedSid.value,
              userId: state.credentials.userId,
              userName: state.userInfo.user_name,
              headurl: state.userInfo.headurl,
              apiSt: state.credentials.apiSt,
              apiAt: state.credentials.apiAt,
              bUserId: state.credentials.bUserId,
              ssecurity: state.credentials.ssecurity,
              passToken: state.credentials.passToken,
            })
            await loadAccounts()
          }
          qrImageData.value = ''
          break
        case 'error':
          scanStatus.value = { type: 'error', text: state.error || '登录失败' }
          qrImageData.value = ''
          break
      }
    }
  } catch (err: any) {
    scanStatus.value = { type: 'error', text: err.message || '登录异常' }
    qrImageData.value = ''
  } finally {
    isScanning.value = false
  }
}

async function removeAccount(id: number) {
  await deleteAccount(id)
  await loadAccounts()
}

async function clearAll() {
  await clearAccounts()
  await loadAccounts()
  confirmClear.value = false
}

onMounted(() => {
  loadAccounts()
})
</script>
