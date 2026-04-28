/**
 *  Writing a class-based HTTP wrapper around Axios
 */

import axios from 'axios'
import type{
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig
} from 'axios'

/**
 * Typed error shape - REACT
 * - interface ApiError
 */

export interface ApiError {
    status: number
    message: string
    fieldErrors?: Record<string, string[]>
}


/**
 *  Class ApiClient{
 *      constructor()
 *      private registerInterceptors()
 *      private normalizeError()
 *      public async get()
 *      public async post()
 *      public async put()
 *      public async patch()
 *      public async delete()
 *  }
 */

export class ApiClient {
    private readonly axios: AxiosInstance

    constructor(baseURL: string) {
        this.axios = axios.create({
            baseURL,
            timeout: 10_000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        })
        this.registerInterceptors()

    }

    // Register REQUEST & RESPONSE Interceptors
    private registerInterceptors(): void {
        this.axios.interceptors.request.use(
            (config) => {
            if (import.meta.env.DEV) {
                console.debug(`[api] → ${config.method?.toUpperCase()} ${config.url}`)
            }
            return config
            }
        )
        this.axios.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                const normalised: ApiError = this.normaliseError(error)
                return Promise.reject(normalised)
            }
        )
    }

    // Convert AxiosError -> ApiError
    private normaliseError(error: AxiosError): ApiError {
        if (!error.response) {
            return {
                status: 0,
                message: error.message || 'Network error — is the server running?',
            }
        }
        const { status, data } = error.response

        if (data && typeof data === 'object') {
            const maybeDetail = (data as Record<string, unknown>).detail
            if (typeof maybeDetail === 'string') {
                return { status, message: maybeDetail}
            }
            return {
                status,
                message: `Request failed with status ${status}`,
                fieldErrors: data as Record<string, string[]>
            }
        }
        return { status, message: `Request failed with status ${status}` }
    }

    public async get<T>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.axios.get<T>(url, config)
        return response.data
   }

    public async post<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.axios.post<T>(url, body, config)
        return response.data
    }

    public async put<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.axios.put<T>(url, body, config)
        return response.data
    }

    public async patch<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.axios.patch<T>(url, body, config)
        return response.data
    }

    public async delete<T = void>(
    url: string,
    config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.axios.delete<T>(url, config)
        return response.data
    }
}

// -- Singleton Export --
export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL)
