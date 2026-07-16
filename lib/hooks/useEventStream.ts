/**
 * useEventStream Hook
 *
 * Subscribe to event stream updates for real-time analysis progress.
 * Handles event subscription cleanup and error management.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ApiError } from '@/lib/api/errors'
import { createEventStream } from '@/lib/api/event-stream'
import type {
  EventStreamInterface,
  AnalysisStatusResponse,
  AnalysisResults,
} from '@/lib/types/api'

interface UseEventStreamState {
  status: AnalysisStatusResponse | null
  results: AnalysisResults | null
  error: ApiError | null
  isRunning: boolean
}

interface UseEventStreamReturn extends UseEventStreamState {
  start: (jobId: string) => void
  stop: () => void
  reset: () => void
}

export function useEventStream(): UseEventStreamReturn {
  const [state, setState] = useState<UseEventStreamState>({
    status: null,
    results: null,
    error: null,
    isRunning: false,
  })

  const streamRef = useRef<EventStreamInterface | null>(null)

  // Start listening to event stream
  const start = useCallback((jobId: string) => {
    // Stop existing stream
    if (streamRef.current?.isRunning()) {
      streamRef.current.stop()
    }

    // Create new stream
    const stream = createEventStream()
    streamRef.current = stream

    setState((prev) => ({
      ...prev,
      isRunning: true,
      error: null,
    }))

    // Subscribe to status updates
    stream.on('status-update', (status) => {
      setState((prev) => ({
        ...prev,
        status,
        error: null,
      }))
    })

    // Subscribe to completion
    stream.on('complete', (results) => {
      setState((prev) => ({
        ...prev,
        results,
        isRunning: false,
        error: null,
      }))
    })

    // Subscribe to errors
    stream.on('error', (error) => {
      setState((prev) => ({
        ...prev,
        error,
        // Keep running for retries
      }))
    })

    // Start polling
    stream.start(jobId)
  }, [])

  // Stop listening
  const stop = useCallback(() => {
    if (streamRef.current?.isRunning()) {
      streamRef.current.stop()
    }
    setState((prev) => ({
      ...prev,
      isRunning: false,
    }))
  }, [])

  // Reset state
  const reset = useCallback(() => {
    stop()
    setState({
      status: null,
      results: null,
      error: null,
      isRunning: false,
    })
  }, [stop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current?.isRunning()) {
        streamRef.current.stop()
      }
    }
  }, [])

  return {
    ...state,
    start,
    stop,
    reset,
  }
}
