/**
 * HTTP Client
 *
 * Centralized HTTP client with:
 * - Automatic retry with exponential backoff
 * - Timeout handling
 * - Error parsing
 * - Development mock mode fallback
 */

import { apiConfig } from '@/lib/api/config'
import {
  ApiError,
  parseApiError,
  isRetryableError,
  TimeoutError,
  NetworkError,
  ApiResponse,
} from '@/lib/api/errors'
import {
  getMockUploadResponse,
  getMockAnalysisStatus,
  getMockAnalysisResults,
  getMockExportResponse,
  simulateMockDelay,
} from '@/lib/api/mock-responses'
import type {
  UploadResponse,
  AnalysisStatusResponse,
  AnalysisResults,
  ExportResponse,
  Modality,
} from '@/lib/types/api'

interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
}

interface RequestOptions extends RequestInit {
  timeout?: number
  retryOptions?: RetryOptions
}

class HttpClient {
  private baseUrl: string
  private defaultTimeout: number
  private defaultRetryOptions: RetryOptions

  constructor() {
    this.baseUrl = apiConfig.baseUrl
    this.defaultTimeout = apiConfig.timeouts.default
    this.defaultRetryOptions = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
    }
  }

  /**
   * Create abort signal with timeout
   */
  private createAbortSignal(timeout: number): AbortSignal {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    return controller.signal
  }

  /**
   * Exponential backoff for retries
   */
  private async delay(attempt: number, options: RetryOptions): Promise<void> {
    const { baseDelay = 1000, maxDelay = 10000 } = options
    const delayMs = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  /**
   * Fetch with automatic retry and timeout handling
   */
  async fetch<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retryOptions = this.defaultRetryOptions,
      ...fetchOptions
    } = options

    const maxRetries = retryOptions.maxRetries || 0
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const fullUrl = url.startsWith('http')
          ? url
          : `${this.baseUrl}${url}`

        const signal = this.createAbortSignal(timeout)

        const response = await fetch(fullUrl, {
          ...fetchOptions,
          signal,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          const error = parseApiError(response.status, data)
          lastError = error

          // Don't retry client errors
          if (response.status >= 400 && response.status < 500) {
            throw error
          }

          // Retry server errors if attempts remaining
          if (attempt < maxRetries) {
            await this.delay(attempt, retryOptions)
            continue
          }

          throw error
        }

        const data = await response.json()
        return data as ApiResponse<T>
      } catch (error) {
        lastError = error as Error

        // Handle abort signal (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = new TimeoutError()
          if (attempt < maxRetries) {
            await this.delay(attempt, retryOptions)
            continue
          }
          throw lastError
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          lastError = new NetworkError(error)
          if (attempt < maxRetries) {
            await this.delay(attempt, retryOptions)
            continue
          }
          throw lastError
        }

        // If it's already an ApiError, check if retryable
        if (error instanceof ApiError) {
          if (isRetryableError(error) && attempt < maxRetries) {
            await this.delay(attempt, retryOptions)
            continue
          }
          throw error
        }

        throw lastError
      }
    }

    throw lastError || new ApiError('UNKNOWN_ERROR', 'An unknown error occurred')
  }

  /**
   * GET request
   */
  async get<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * POST with FormData (for file uploads)
   */
  async postFormData<T>(
    url: string,
    formData: FormData,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http')
      ? url
      : `${this.baseUrl}${url}`

    const timeout = options.timeout || apiConfig.timeouts.upload
    const signal = this.createAbortSignal(timeout)

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        body: formData,
        signal,
        headers: options.headers as Record<string, string>,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw parseApiError(response.status, data)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError()
      }
      if (error instanceof TypeError) {
        throw new NetworkError(error)
      }
      throw error
    }
  }
}

// Export singleton instance
export const httpClient = new HttpClient()

/**
 * Mock-aware fetch wrapper for development
 */
export async function fetchWithMockFallback<T>(
  operation: () => Promise<ApiResponse<T>>,
  mockOperation: () => Promise<T | ApiResponse<T>>
): Promise<T> {
  if (apiConfig.useMockApi) {
    const result = await mockOperation()
    
    // If mock returns raw data, wrap in success response
    if (result && typeof result === 'object' && 'success' in result) {
      const response = result as ApiResponse<T>
      if (response.success) {
        return response.data
      }
      throw new ApiError(response.error.code, response.error.message)
    }
    
    return result as T
  }

  const response = await operation()
  if (response.success) {
    return response.data
  }
  throw new ApiError(response.error.code, response.error.message)
}
