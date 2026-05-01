import { proxy } from './proxy'

const BASE_URL = 'https://id.kuaishou.com'

function defaultProxyOptions() {
  return {
    timings: true,
    timeout: 300000,
    rejectUnauthorized: false,
    followRedirect: true,
  }
}

export interface QRLoginUserInfo {
  user_id: number
  user_name: string
  user_sex: string
  headurl: string
}

export interface QRLoginCredentials {
  ssecurity: string
  passToken: string
  apiSt: string
  apiAt: string
  bUserId: number
  userId: number
  sid: string
}

export interface QRLoginState {
  stage: 'start' | 'scanning' | 'scanned' | 'accepting' | 'accepted' | 'done' | 'error'
  qrUrl?: string
  qrImageData?: string
  qrLoginToken?: string
  qrLoginSignature?: string
  userInfo?: QRLoginUserInfo
  credentials?: QRLoginCredentials
  error?: string
}

async function postForm(path: string, data: Record<string, string>) {
  const params = new URLSearchParams(data)
  return proxy.post(`${BASE_URL}${path}`, params.toString(), {
    originalHeaders: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    proxyOptions: defaultProxyOptions(),
  })
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function* qrLogin(): AsyncGenerator<QRLoginState, void, unknown> {
  const sid = 'kuaishou.web.cp.api'
  const channelType = 'PC_PAGE'
  const isWebSig4 = 'true'

  // Step 1: start
  let startRes: any
  try {
    startRes = (await postForm('/rest/c/infra/ks/qr/start', {
      sid,
      channelType,
      isWebSig4,
    })).data
  } catch (err: any) {
    yield { stage: 'error', error: err.message || 'start failed' }
    return
  }

  if (startRes.result !== 1) {
    yield { stage: 'error', error: `start failed: result=${startRes.result}` }
    return
  }

  const qrLoginToken = startRes.qrLoginToken as string
  const qrLoginSignature = startRes.qrLoginSignature as string

  yield {
    stage: 'start',
    qrUrl: startRes.qrUrl,
    qrImageData: startRes.imageData,
    qrLoginToken,
    qrLoginSignature,
  }

  // Step 2: polling scanResult
  yield { stage: 'scanning' }

  let scanRes: any
  let scanAttempts = 0
  const maxScanAttempts = 60 // ~60 seconds

  while (scanAttempts < maxScanAttempts) {
    await sleep(1000)
    try {
      scanRes = (await postForm('/rest/c/infra/ks/qr/scanResult', {
        qrLoginToken,
        qrLoginSignature,
        channelType,
        isWebSig4,
      })).data
    } catch {
      scanAttempts++
      continue
    }

    if (scanRes.result === 1 && scanRes.user) {
      break
    }
    scanAttempts++
  }

  if (!scanRes || scanRes.result !== 1 || !scanRes.user) {
    yield { stage: 'error', error: 'scan timeout or failed' }
    return
  }

  const userInfo: QRLoginUserInfo = {
    user_id: scanRes.user.user_id,
    user_name: scanRes.user.user_name,
    user_sex: scanRes.user.user_sex,
    headurl: scanRes.user.headurl,
  }

  yield { stage: 'scanned', userInfo }

  // Step 3: polling acceptResult
  yield { stage: 'accepting' }

  let acceptRes: any
  let acceptAttempts = 0
  const maxAcceptAttempts = 60 // ~60 seconds

  while (acceptAttempts < maxAcceptAttempts) {
    await sleep(1000)
    try {
      acceptRes = (await postForm('/rest/c/infra/ks/qr/acceptResult', {
        qrLoginToken,
        qrLoginSignature,
        sid,
        channelType,
        isWebSig4,
      })).data
    } catch {
      acceptAttempts++
      continue
    }

    if (acceptRes.result === 1 && acceptRes.qrToken) {
      break
    }
    acceptAttempts++
  }

  if (!acceptRes || acceptRes.result !== 1 || !acceptRes.qrToken) {
    yield { stage: 'error', error: 'accept timeout or failed' }
    return
  }

  yield { stage: 'accepted' }

  // Step 4: callback
  let callbackRes: any
  try {
    callbackRes = (await postForm('/pass/kuaishou/login/qr/callback', {
      qrToken: acceptRes.qrToken,
      sid,
      channelType,
      isWebSig4,
    })).data
  } catch (err: any) {
    yield { stage: 'error', error: err.message || 'callback failed' }
    return
  }

  if (callbackRes.result !== 1) {
    yield { stage: 'error', error: `callback failed: result=${callbackRes.result}` }
    return
  }

  const credentials: QRLoginCredentials = {
    ssecurity: callbackRes.ssecurity,
    passToken: callbackRes.passToken,
    apiSt: callbackRes['kuaishou.web.cp.api_st'],
    apiAt: callbackRes['kuaishou.web.cp.api.at'],
    bUserId: callbackRes.bUserId,
    userId: callbackRes.userId,
    sid: callbackRes.sid,
  }

  yield {
    stage: 'done',
    userInfo,
    credentials,
  }
}
