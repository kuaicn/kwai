import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const COOKIE =
  'did%3Dweb_wsn83te8m4yf53w62gljja1x35mggkkf; sid%3Dkuaishou.shop.b; bUserId%3D1000600158574; userId%3D5434959379; kuaishou.shop.b_st%3DChJrdWFpc2hvdS5zaG9wLmIuc3QSoAGvgwEwvAFYCtw9il6AzVhiCweC9SzDV2gu7bKT8Lr11IvJbYvFsgXihmW3bjjWPlSl4vmNwnDhihY5Fm7rhjwjdGW6LXzRyIEUZjw6qm8bqf5nGeG4X2rPK4l5K1lg-l2UKCP--rOr0XF75r9852-y7gghNuLUlu7UImQ5d19bw76Q3LaNwS7JFWo4IKB-3ud1GsU-6ygANiPjrCC0uQo1GhI6AjZAm21RFhrJYP79BslttNciIPxHFP7fFBKCKraGE0JgCoEhh6t5L5YJMsn40xQXeDarKAUwAQ; kuaishou.shop.b_ph%3D21f81941e4d563a96872665eff4a3b208cf8'

interface ProxyOptions {
  method: string
  timings?: boolean
  timeout?: number
  rejectUnauthorized?: boolean
  followRedirect?: boolean
}

function buildApiH0(originalHeaders?: Record<string, string>): string {
  const parts: string[] = []
  if (originalHeaders) {
    for (const [key, value] of Object.entries(originalHeaders)) {
      parts.push(`${key}=${value}`)
    }
  }
  parts.push(`Cookie=${COOKIE}`)
  return parts.join(', ')
}

function buildApiO0(options: ProxyOptions): string {
  const parts: string[] = [`method=${options.method.toUpperCase()}`]
  if (options.timings !== undefined) parts.push(`timings=${options.timings}`)
  if (options.timeout !== undefined) parts.push(`timeout=${options.timeout}`)
  if (options.rejectUnauthorized !== undefined) parts.push(`rejectUnauthorized=${options.rejectUnauthorized}`)
  if (options.followRedirect !== undefined) parts.push(`followRedirect=${options.followRedirect}`)
  return parts.join(', ')
}

class ProxyAxios {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: 'https://web-proxy.apifox.cn',
      timeout: 30000,
    })
  }

  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig & {
      originalHeaders?: Record<string, string>
      proxyOptions?: Omit<ProxyOptions, 'method'>
    },
  ) {
    const { originalHeaders, proxyOptions, ...restConfig } = config || {}
    return this.client.post<T>('/api/v1/request', data, {
      ...restConfig,
      headers: {
        ...restConfig.headers,
        'api-h0': buildApiH0(originalHeaders),
        'api-o0': buildApiO0({ method, ...proxyOptions }),
        'api-u': url,
      },
    })
  }

  get<T = any>(url: string, config?: AxiosRequestConfig & { originalHeaders?: Record<string, string>; proxyOptions?: Omit<ProxyOptions, 'method'> }) {
    return this.request<T>('GET', url, undefined, config)
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig & { originalHeaders?: Record<string, string>; proxyOptions?: Omit<ProxyOptions, 'method'> }) {
    return this.request<T>('POST', url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig & { originalHeaders?: Record<string, string>; proxyOptions?: Omit<ProxyOptions, 'method'> }) {
    return this.request<T>('PUT', url, data, config)
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig & { originalHeaders?: Record<string, string>; proxyOptions?: Omit<ProxyOptions, 'method'> }) {
    return this.request<T>('PATCH', url, data, config)
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig & { originalHeaders?: Record<string, string>; proxyOptions?: Omit<ProxyOptions, 'method'> }) {
    return this.request<T>('DELETE', url, undefined, config)
  }
}

export const proxy = new ProxyAxios()
