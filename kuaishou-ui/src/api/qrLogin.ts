import { proxy } from './proxy'

const BASE_URL = 'https://id.kuaishou.com'

function defaultProxyOptions() {
  return {
    timings: true,
    timeout: 70000,
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



export async function* qrLogin(
  sid: string = 'kuaishou.web.cp.api',
): AsyncGenerator<QRLoginState, void, unknown> {
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

  // Step 2: scanResult (server-side long-polling ~60s)
  yield { stage: 'scanning' }

  let scanRes: any
  try {
    scanRes = (await postForm('/rest/c/infra/ks/qr/scanResult', {
      qrLoginToken,
      qrLoginSignature,
      channelType,
      isWebSig4,
    })).data
  } catch (err: any) {
    yield { stage: 'error', error: err.message || 'scanResult failed' }
    return
  }

  if (scanRes.result !== 1 || !scanRes.user) {
    yield { stage: 'error', error: `scanResult failed: result=${scanRes.result}` }
    return
  }

  const userInfo: QRLoginUserInfo = {
    user_id: scanRes.user.user_id,
    user_name: scanRes.user.user_name,
    user_sex: scanRes.user.user_sex,
    headurl: scanRes.user.headurl,
  }

  yield { stage: 'scanned', userInfo }

  // Step 3: acceptResult (server-side long-polling ~60s)
  yield { stage: 'accepting' }

  let acceptRes: any
  try {
    acceptRes = (await postForm('/rest/c/infra/ks/qr/acceptResult', {
      qrLoginToken,
      qrLoginSignature,
      sid,
      channelType,
      isWebSig4,
    })).data
  } catch (err: any) {
    yield { stage: 'error', error: err.message || 'acceptResult failed' }
    return
  }

  if (acceptRes.result !== 1 || !acceptRes.qrToken) {
    yield { stage: 'error', error: `acceptResult failed: result=${acceptRes.result}` }
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
