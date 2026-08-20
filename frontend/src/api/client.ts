
import axios from 'axios'
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'

import { tokens } from '../lib/tokens'

export interface ApiError {
  status: number              // HTTP status (0 = network / CORS / aborted)
  message: string             // human-readable message
  fieldErrors?: Record<string, string[]>  // DRF-style per-field validation errors
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

export class ApiClient {
  private readonly axios: AxiosInstance
  private readonly baseURL: string
  private static readonly AUTH_PUBLIC_PATHS = [
    '/auth/login/',
    '/auth/register/',
    '/auth/refresh/',
  ]

  private refreshPromise: Promise<string> | null = null
  private onAuthFailure: (() => void) | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL

    this.axios = axios.create({
      baseURL,
      timeout: 10_000, // 10 seconds — fail fast so the UI doesn't hang
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    this.registerInterceptors()
  }

  public setOnAuthFailure(callback: () => void): void {
    this.onAuthFailure = callback
  }

  private registerInterceptors(): void {
    this.axios.interceptors.request.use((config) => {
      const url = config.url ?? ''
      const isPublic = ApiClient.AUTH_PUBLIC_PATHS.some((p) => url.endsWith(p))

      if (!isPublic) {
        const token = tokens.getAccess()
        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`)
        }
      }

      if (import.meta.env.DEV) {
        console.debug(
          `[api] → ${config.method?.toUpperCase()} ${url}${isPublic ? ' (public)' : ''}`,
        )
      }

      return config
    })
    this.axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalConfig = error.config as RetryConfig | undefined
        if (
          !originalConfig ||
          error.response?.status !== 401 ||
          originalConfig._retry
        ) {
          return Promise.reject(this.normaliseError(error))
        }
        originalConfig._retry = true

        try {
          const newAccess = await this.refreshAccessToken()
          originalConfig.headers.set('Authorization', `Bearer ${newAccess}`)
          return this.axios(originalConfig)
        } catch {
          tokens.clear()
          this.onAuthFailure?.()
          return Promise.reject(this.normaliseError(error))
        }
      },
    )
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = tokens.getRefresh()
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post<{ access: string; refresh?: string }>(
          `${this.baseURL}/auth/refresh/`,
          { refresh: refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        const { access, refresh: newRefresh } = response.data
        tokens.save(access, newRefresh ?? refreshToken)
        return access
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  private normaliseError(error: AxiosError): ApiError {
    // No response at all → network or CORS issue
    if (!error.response) {
      return {
        status: 0,
        message: error.message || 'Network error — is the server running?',
      }
    }

    const { status, data } = error.response

    // DRF typically returns an object; sometimes just { detail: "..." }
    if (data && typeof data === 'object') {
      const maybeDetail = (data as Record<string, unknown>).detail
      if (typeof maybeDetail === 'string') {
        return { status, message: maybeDetail }
      }
      // Assume field errors — shape { field: [strings] }
      return {
        status,
        message: `Request failed with status ${status}`,
        fieldErrors: data as Record<string, string[]>,
      }
    }

    return { status, message: `Request failed with status ${status}` }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axios.get<T>(url, config)
    return response.data
  }

  public async async<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axios.post<T>(url, body, config)
    return response.data
  }

  public async put<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axios.put<T>(url, body, config)
    return response.data
  }

  public async patch<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axios.patch<T>(url, body, config)
    return response.data
  }

  public async delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axios.delete<T>(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL)
