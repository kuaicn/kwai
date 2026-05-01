import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

function serializeHeaders(headers: Record<string, string>): string {
  return Object.entries(headers)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join(', ')
}

function serializeOptions(options: Record<string, string | number | boolean>): string {
  return Object.entries(options)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ')
}

interface ProxyRequestConfig extends AxiosRequestConfig {
  originalHeaders?: Record<string, string>
  proxyOptions?: Record<string, string | number | boolean>
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
    config?: ProxyRequestConfig,
  ) {
    const { originalHeaders, proxyOptions, ...restConfig } = config || {}

    const headers: Record<string, any> = {
      ...(restConfig.headers as Record<string, any>),
      'api-u': url,
    }

    if (originalHeaders && Object.keys(originalHeaders).length > 0) {
      headers['api-h0'] = serializeHeaders(originalHeaders)
    }

    const opts: Record<string, string | number | boolean> = {
      method: method.toUpperCase(),
      ...proxyOptions,
    }
    headers['api-o0'] = serializeOptions(opts)

    return this.client.post<T>('/api/v1/request', data, {
      ...restConfig,
      headers,
    })
  }

  get<T = any>(url: string, config?: ProxyRequestConfig) {
    return this.request<T>('GET', url, undefined, config)
  }

  post<T = any>(url: string, data?: any, config?: ProxyRequestConfig) {
    return this.request<T>('POST', url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: ProxyRequestConfig) {
    return this.request<T>('PUT', url, data, config)
  }

  patch<T = any>(url: string, data?: any, config?: ProxyRequestConfig) {
    return this.request<T>('PATCH', url, data, config)
  }

  delete<T = any>(url: string, config?: ProxyRequestConfig) {
    return this.request<T>('DELETE', url, undefined, config)
  }
}

export const proxy = new ProxyAxios()
