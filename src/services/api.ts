import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { getEnv } from '@/config/env'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type Request = {
  axiosConfig?: AxiosRequestConfig
  method: HttpMethod
  url: string
}

export class ApiClient {
  private static _instance: ApiClient | null = null
  private static _axios: AxiosInstance
  private static _headers: Map<string, string> = new Map()
  private static _tokenProvider?: () => Promise<string | null> | string | null

  private constructor(axiosInstance: AxiosInstance) {
    ApiClient._axios = axiosInstance
  }

  public static getInstance(): ApiClient {
    if (!ApiClient._instance) {
      const { VITE_API_BASE_URL } = getEnv()
      // Si no hay VITE_API_BASE_URL, usamos el backend local por defecto
      const baseURL = VITE_API_BASE_URL || 'http://localhost:4000'
      ApiClient._instance = new ApiClient(
        axios.create({ baseURL })
      )
    }
    return ApiClient._instance
  }

  public static setAuthTokenProvider(
    provider: () => Promise<string | null> | string | null,
  ): void {
    ApiClient._tokenProvider = provider
  }

  public setErrorInterceptor(interceptor: (error: unknown) => void) {
    ApiClient._axios.interceptors.response.use(
      (res) => res,
      (error) => {
        interceptor(error)
        return Promise.reject(error)
      }
    )
  }

  public setHeader(key: string, value: string): void {
    ApiClient._headers.set(key, value)
  }

  public removeHeader(key: string): void {
    ApiClient._headers.delete(key)
  }

  public clearHeaders(): void {
    ApiClient._headers.clear()
  }

  private static async request<T>({ method, url, axiosConfig = {} }: Request) {
    const headers = Object.fromEntries(ApiClient._headers.entries())
    // Try to get bearer token from provider if available and not already set
    let bearer: string | null = null
    if (ApiClient._tokenProvider) {
      const maybe = ApiClient._tokenProvider()
      bearer = typeof (maybe as any)?.then === 'function' ? await (maybe as Promise<string | null>) : (maybe as string | null)
    }
    const { data } = await ApiClient._axios({
      ...axiosConfig,
      method,
      url,
      headers: {
        ...headers,
        ...axiosConfig.headers,
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
    })
    return data as T
  }

  public get = async <T = unknown>(url: string, axiosConfig: AxiosRequestConfig = {}) => {
    return ApiClient.request<T>({ method: 'GET', url, axiosConfig })
  }

  public post = async <T = unknown>(url: string, axiosConfig: AxiosRequestConfig = {}) => {
    return ApiClient.request<T>({ method: 'POST', url, axiosConfig })
  }

  public put = async <T = unknown>(url: string, axiosConfig: AxiosRequestConfig = {}) => {
    return ApiClient.request<T>({ method: 'PUT', url, axiosConfig })
  }

  public delete = async <T = unknown>(url: string, axiosConfig: AxiosRequestConfig = {}) => {
    return ApiClient.request<T>({ method: 'DELETE', url, axiosConfig })
  }

  public patch = async <T = unknown>(url: string, axiosConfig: AxiosRequestConfig = {}) => {
    return ApiClient.request<T>({ method: 'PATCH', url, axiosConfig })
  }
}

export const ApiInstance = ApiClient.getInstance()
