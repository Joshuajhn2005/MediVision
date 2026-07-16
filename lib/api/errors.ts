/**
 * API Error Handling
 *
 * Custom error classes and user-friendly error messages for API operations.
 */

export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status?: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends ApiError {
  constructor(originalError?: unknown) {
    super('NETWORK_ERROR', 'Connection failed. Please check your internet connection.', undefined, originalError)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends ApiError {
  constructor() {
    super('TIMEOUT_ERROR', 'Request took too long. Please try again.', undefined)
    this.name = 'TimeoutError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400)
    this.name = 'ValidationError'
  }
}

export class FileUploadError extends ApiError {
  constructor(message: string) {
    super('FILE_UPLOAD_ERROR', message, 400)
    this.name = 'FileUploadError'
  }
}

export interface ApiErrorResponse {
  success: false
  data: null
  error: {
    code: string
    message: string
  }
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  error: null
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Parse API error response and throw appropriate error
 */
export function parseApiError(
  status: number,
  data: unknown,
  originalError?: unknown
): ApiError {
  // Handle error response format
  if (
    data &&
    typeof data === 'object' &&
    'error' in data &&
    typeof data.error === 'object'
  ) {
    const error = data.error as { code?: string; message?: string }
    return new ApiError(
      error.code || `HTTP_${status}`,
      error.message || `Server error (${status})`,
      status,
      originalError
    )
  }

  // Handle common HTTP status codes
  switch (status) {
    case 400:
      return new ValidationError('Invalid request. Please check your input.')
    case 401:
      return new ApiError('UNAUTHORIZED', 'Authentication failed. Please log in.', 401)
    case 403:
      return new ApiError('FORBIDDEN', 'You do not have permission to perform this action.', 403)
    case 404:
      return new ApiError('NOT_FOUND', 'Resource not found.', 404)
    case 409:
      return new ApiError('CONFLICT', 'The resource already exists or is in use.', 409)
    case 413:
      return new FileUploadError('File is too large. Maximum size is 100MB.')
    case 422:
      return new ValidationError('Invalid file format or data.')
    case 429:
      return new ApiError('RATE_LIMIT', 'Too many requests. Please wait before trying again.', 429)
    case 500:
      return new ApiError('SERVER_ERROR', 'Server error. Please try again later.', 500)
    case 502:
    case 503:
      return new ApiError('SERVICE_UNAVAILABLE', 'Service temporarily unavailable. Please try again later.', status)
    case 504:
      return new TimeoutError()
    default:
      return new ApiError(
        `HTTP_${status}`,
        `Request failed with status ${status}`,
        status,
        originalError
      )
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false

  // Retryable error codes
  const retryableCodes = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'SERVICE_UNAVAILABLE',
    'RATE_LIMIT',
  ]

  return retryableCodes.includes(error.code)
}
