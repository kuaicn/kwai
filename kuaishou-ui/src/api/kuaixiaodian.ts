import { proxy } from './proxy'

const BASE_URL = 'https://mcn.kwaixiaodian.com'

function buildCookieHeader(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}

function defaultProxyOptions() {
  return {
    timings: true,
    timeout: 300000,
    rejectUnauthorized: false,
    followRedirect: true,
  }
}

export interface SearchParams {
  userName: string | number
  type: number
}

export function searchUser(params: SearchParams, cookies: Record<string, string>) {
  const query = new URLSearchParams({
    userName: String(params.userName),
    type: String(params.type),
  })
  return proxy.get(`${BASE_URL}/rest/enrichment/esp/pc/search?${query.toString()}`, {
    originalHeaders: {
      Cookie: buildCookieHeader(cookies),
    },
    proxyOptions: defaultProxyOptions(),
  })
}

export interface InviteBody {
  bindModel: number
  memberId: number
  validEndTime: number
  phoneNum: string
  verifyCode: string
  accounting: number
  cooperationType: number
}

export function inviteUser(body: InviteBody, cookies: Record<string, string>) {
  return proxy.post(`${BASE_URL}/rest/enrichment/esp/pc/esp/invitation/invite`, body, {
    originalHeaders: {
      Cookie: buildCookieHeader(cookies),
      'Content-Type': 'application/json',
    },
    proxyOptions: defaultProxyOptions(),
  })
}

export interface VerifyBody {
  memberId: number
  phoneNum: string
}

export function verifyInvitation(body: VerifyBody, cookies: Record<string, string>) {
  return proxy.post(`${BASE_URL}/rest/enrichment/esp/pc/esp/invitation/verify`, body, {
    originalHeaders: {
      Cookie: buildCookieHeader(cookies),
      'Content-Type': 'application/json',
    },
    proxyOptions: defaultProxyOptions(),
  })
}

export interface QueryBody {
  pageNum: number
  pageSize: number
}

export function queryInvitations(body: QueryBody, cookies: Record<string, string>) {
  return proxy.post(`${BASE_URL}/rest/enrichment/esp/pc/esp/invitation/query`, body, {
    originalHeaders: {
      Cookie: buildCookieHeader(cookies),
      'Content-Type': 'application/json',
    },
    proxyOptions: defaultProxyOptions(),
  })
}

export async function fetchUnsettledBills(
  cookies: Record<string, string>,
  createTimeGte: number,
  createTimeLte: number,
): Promise<any[]> {
  const limit = 100

  function buildQuery(page: number) {
    return new URLSearchParams({
      role: 'MCN',
      limit: String(limit),
      page: String(page),
      createTimeGte: String(createTimeGte),
      createTimeLte: String(createTimeLte),
    })
  }

  function fetchPage(page: number) {
    return proxy.get(
      `${BASE_URL}/rest/app/tts/business/api/funds/financial/bill/unsettle/list?${buildQuery(page).toString()}`,
      {
        originalHeaders: {
          Cookie: buildCookieHeader(cookies),
        },
        proxyOptions: defaultProxyOptions(),
      },
    )
  }

  const firstRes: any = await fetchPage(1)

  if (firstRes.data.result === 109) {
    throw new Error('SESSION_EXPIRED')
  }

  if (firstRes.data.result !== 1) {
    return []
  }

  const firstRecords: any[] = firstRes.data.data?.record || []
  const total: number = firstRes.data.data?.total || 0

  if (total === 0 || firstRecords.length >= total) {
    return firstRecords
  }

  const totalPages = Math.ceil(total / limit)
  const remainingPages: Promise<any>[] = []
  for (let p = 2; p <= totalPages; p++) {
    remainingPages.push(fetchPage(p))
  }

  const results = await Promise.all(remainingPages)

  const allRecords = [...firstRecords]
  for (const res of results) {
    if (res.data.result !== 1) continue
    const records = res.data.data?.record || []
    allRecords.push(...records)
  }

  return allRecords
}

export interface OutcallLoginBody {
  receiverId: number
  callerName?: string
  businessId: number
  role: number
  queues: string[]
}

export function getOutcallLoginInfo(body: OutcallLoginBody, cookies: Record<string, string>) {
  return proxy.post(
    `${BASE_URL}/gateway/business/merchant/message/center/m/outcall/login/info/org/get`,
    body,
    {
      originalHeaders: {
        Cookie: buildCookieHeader(cookies),
        'Content-Type': 'application/json',
      },
      proxyOptions: defaultProxyOptions(),
    },
  )
}
