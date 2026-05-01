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
