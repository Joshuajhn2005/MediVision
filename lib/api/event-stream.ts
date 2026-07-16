/**
 * Event Stream
 *
 * Abstract event-driven architecture for analysis pipeline.
 * Allows polling (current) or SSE/WebSocket (future) without component changes.
 *
 * Components subscribe to events:
 *   stream.on('status-update', (status) => { ... })
 *   stream.on('complete', (results) => { ... })
 *   stream.on('error', (error) => { ... })
 */

import { apiConfig } from '@/lib/api/config'
import { ApiError, TimeoutError } from '@/lib/api/errors'
import { httpClient } from '@/lib/api/client'
import {
  getMockAnalysisStatus,
} from '@/lib/api/mock-responses'
import type {
  AnalysisStatusResponse,
  AnalysisResults,
  AnalysisStatus,
} from '@/lib/types/api'

type EventHandler<T> = (data: T) => void

export interface EventStreamInterface {
  on(event: 'status-update', handler: EventHandler<AnalysisStatusResponse>): void
  on(event: 'complete', handler: EventHandler<AnalysisResults>): void
  on(event: 'error', handler: EventHandler<ApiError>): void
  off(event: string, handler: EventHandler<unknown>): void
  start(jobId: string): void
  stop(): void
  isRunning(): boolean
}

/**
 * Polling-based event stream
 * Can be replaced with SSEEventStream or WebSocketEventStream later
 */
export class PollingEventStream implements EventStreamInterface {
  private listeners: Map<string, Set<EventHandler<unknown>>> = new Map()
  private pollingInterval: number | null = null
  private currentJobId: string | null = null
  private isActive = false
  private lastProgress: number = 0
  private pollInterval = apiConfig.polling.interval
  private backoffInterval = this.pollInterval
  private startTime: number = 0
  private mockElapsedMs: number = 0

  constructor(private mockMode: boolean = false) {}

  /**
   * Subscribe to event
   */
  on(
    event: 'status-update' | 'complete' | 'error',
    handler: EventHandler<unknown>
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
  }

  /**
   * Unsubscribe from event
   */
  off(event: string, handler: EventHandler<unknown>): void {
    this.listeners.get(event)?.delete(handler)
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(data)
      } catch (error) {
        console.error(`[EventStream] Error in ${event} handler:`, error)
      }
    })
  }

  /**
   * Start polling for analysis status
   */
  start(jobId: string): void {
    if (this.isActive) {
      this.stop()
    }

    this.currentJobId = jobId
    this.isActive = true
    this.lastProgress = 0
    this.startTime = Date.now()
    this.mockElapsedMs = 0
    this.backoffInterval = this.pollInterval

    console.log('[EventStream] Starting poll for job:', jobId)
    this.poll()
  }

  /**
   * Stop polling
   */
  stop(): void {
    if (this.pollingInterval !== null) {
      clearTimeout(this.pollingInterval)
      this.pollingInterval = null
    }
    this.isActive = false
    this.currentJobId = null
    console.log('[EventStream] Stopped polling')
  }

  /**
   * Check if stream is actively polling
   */
  isRunning(): boolean {
    return this.isActive
  }

  /**
   * Poll status from backend
   */
  private async poll(): Promise<void> {
    if (!this.isActive || !this.currentJobId) {
      return
    }

    try {
      let status: AnalysisStatusResponse

      if (this.mockMode) {
        this.mockElapsedMs = Date.now() - this.startTime
        status = getMockAnalysisStatus(this.currentJobId, this.mockElapsedMs)
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 100))
      } else {
        const response = await httpClient.get<AnalysisStatusResponse>(
          apiConfig.endpoints.analysisStatus(this.currentJobId),
          {
            timeout: apiConfig.timeouts.analysis,
            retryOptions: { maxRetries: 1 }, // Light retry for polling
          }
        )

        if (!response.success) {
          throw new ApiError(
            response.error.code,
            response.error.message
          )
        }

        status = response.data
      }

      // Emit status update
      this.emit('status-update', status)

      // Handle completion
      if (status.status === 'complete') {
        if (status.results) {
          this.emit('complete', status.results)
        }
        this.stop()
        return
      }

      // Handle error
      if (status.status === 'error') {
        const error = new ApiError(
          'ANALYSIS_FAILED',
          status.error || 'Analysis failed. Please try again.'
        )
        this.emit('error', error)
        this.stop()
        return
      }

      // Reset backoff on successful poll
      this.backoffInterval = this.pollInterval

      // Schedule next poll with progressive backoff
      this.pollingInterval = window.setTimeout(
        () => this.poll(),
        this.backoffInterval
      )
    } catch (error) {
      console.error('[EventStream] Poll error:', error)

      if (error instanceof TimeoutError) {
        // Increase backoff on timeout
        this.backoffInterval = Math.min(
          this.backoffInterval * apiConfig.polling.backoffMultiplier,
          apiConfig.polling.maxBackoffInterval
        )
      }

      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(
              'POLL_ERROR',
              'Failed to check analysis status. Retrying...'
            )

      // Emit error but continue polling
      this.emit('error', apiError)

      // Retry with backoff
      this.pollingInterval = window.setTimeout(
        () => this.poll(),
        this.backoffInterval
      )
    }
  }
}

/**
 * Create event stream with mode detection
 */
export function createEventStream(mockMode?: boolean): EventStreamInterface {
  return new PollingEventStream(mockMode ?? apiConfig.useMockApi)
}

/**
 * SSE-based event stream (future implementation)
 * Drop-in replacement for PollingEventStream
 */
export class SSEEventStream implements EventStreamInterface {
  private listeners: Map<string, Set<EventHandler<unknown>>> = new Map()
  private eventSource: EventSource | null = null
  private currentJobId: string | null = null

  on(
    event: 'status-update' | 'complete' | 'error',
    handler: EventHandler<unknown>
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
  }

  off(event: string, handler: EventHandler<unknown>): void {
    this.listeners.get(event)?.delete(handler)
  }

  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(data)
      } catch (error) {
        console.error(`[SSEEventStream] Error in ${event} handler:`, error)
      }
    })
  }

  start(jobId: string): void {
    if (this.eventSource) {
      this.stop()
    }

    this.currentJobId = jobId
    const url = `${apiConfig.baseUrl}${apiConfig.endpoints.analysisStatus(jobId)}/stream`

    this.eventSource = new EventSource(url)

    this.eventSource.addEventListener('status', (event) => {
      const status = JSON.parse(event.data) as AnalysisStatusResponse
      this.emit('status-update', status)

      if (status.status === 'complete' && status.results) {
        this.emit('complete', status.results)
        this.stop()
      }

      if (status.status === 'error') {
        const error = new ApiError(
          'ANALYSIS_FAILED',
          status.error || 'Analysis failed'
        )
        this.emit('error', error)
        this.stop()
      }
    })

    this.eventSource.addEventListener('error', (event) => {
      const error = new ApiError('SSE_ERROR', 'Connection error')
      this.emit('error', error)
    })
  }

  stop(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    this.currentJobId = null
  }

  isRunning(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN
  }
}
