/**
 * useApi Hook
 *
 * Generic hook for making API calls with loading/error state management.
 * Handles errors gracefully and provides retry functionality.
 */

import { useState, useCallback } from 'react'
import { ApiError } from '@/lib/api/errors'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (fn: () => Promise<T>) => Promise<T | null>
  retry: () => Promise<T | null>
  reset: () => void
}

export function useApi<T>(
  initialData: T | null = null
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [lastFn, setLastFn] = useState<(() => Promise<T>) | null>(null)

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T | null> => {
      setLoading(true)
      setError(null)
      setLastFn(() => fn)

      try {
        const result = await fn()
        setData(result)
        setLoading(false)
        return result
      } catch (err) {
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError('UNKNOWN_ERROR', 'An error occurred')
        setError(apiError)
        setLoading(false)
        return null
      }
    },
    []
  )

  const retry = useCallback(async (): Promise<T | null> => {
    if (!lastFn) return null
    return execute(lastFn)
  }, [execute, lastFn])

  const reset = useCallback(() => {
    setData(initialData)
    setLoading(false)
    setError(null)
    setLastFn(null)
  }, [initialData])

  return {
    data,
    loading,
    error,
    execute,
    retry,
    reset,
  }
}
