/**
 * Analysis Service
 *
 * Handle analysis lifecycle: upload, processing, results.
 * Integrates with event stream for real-time status updates.
 */

import { apiConfig } from '@/lib/api/config'
import { httpClient, fetchWithMockFallback } from '@/lib/api/client'
import { createEventStream, PollingEventStream } from '@/lib/api/event-stream'
import {
  getMockUploadResponse,
  getMockAnalysisStatus,
  getMockAnalysisResults,
  generateMockJobId,
  simulateMockDelay,
} from '@/lib/api/mock-responses'
import type {
  UploadResponse,
  AnalysisStatusResponse,
  AnalysisResults,
  EventStreamInterface,
} from '@/lib/types/api'

/**
 * Upload file to backend
 */
export async function uploadFile(
  file: File,
  modelEndpoint: string
): Promise<UploadResponse> {
  return fetchWithMockFallback(
    async () => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('model', modelEndpoint)

      return httpClient.postFormData<UploadResponse>(
        apiConfig.endpoints.upload,
        formData,
        {
          timeout: apiConfig.timeouts.upload,
          retryOptions: { maxRetries: 2 },
        }
      )
    },
    async () => {
      await simulateMockDelay(300)
      return getMockUploadResponse(file.name)
    }
  )
}

/**
 * Start analysis with automatic event stream
 * Returns event stream for real-time updates
 */
export async function startAnalysis(
  fileId: string,
  modelEndpoint: string
): Promise<{
  jobId: string
  eventStream: EventStreamInterface
}> {
  const response = await fetchWithMockFallback(
    async () => {
      return httpClient.post<{ job_id: string }>(
        apiConfig.endpoints.analysis(modelEndpoint),
        { file_id: fileId },
        {
          timeout: apiConfig.timeouts.default,
          retryOptions: { maxRetries: 2 },
        }
      )
    },
    async () => {
      await simulateMockDelay(200)
      return { job_id: generateMockJobId() }
    }
  )

  const jobId = response.job_id
  const eventStream = createEventStream()

  return {
    jobId,
    eventStream,
  }
}

/**
 * Get analysis status (manual polling, typically handled by event stream)
 */
export async function getAnalysisStatus(
  jobId: string
): Promise<AnalysisStatusResponse> {
  // Calculate elapsed time for mock
  const startKey = `${jobId}-start`
  if (typeof window !== 'undefined') {
    if (!sessionStorage.getItem(startKey)) {
      sessionStorage.setItem(startKey, Date.now().toString())
    }
  }

  return fetchWithMockFallback(
    async () => {
      return httpClient.get<AnalysisStatusResponse>(
        apiConfig.endpoints.analysisStatus(jobId),
        {
          timeout: apiConfig.timeouts.default,
          retryOptions: { maxRetries: 1 },
        }
      )
    },
    async () => {
      await simulateMockDelay(100)
      
      const elapsedMs = typeof window !== 'undefined'
        ? Date.now() - parseInt(sessionStorage.getItem(startKey) || '0')
        : 0
      
      return getMockAnalysisStatus(jobId, elapsedMs)
    }
  )
}

/**
 * Get analysis results directly
 */
export async function getAnalysisResults(
  jobId: string
): Promise<AnalysisResults> {
  return fetchWithMockFallback(
    async () => {
      return httpClient.get<AnalysisResults>(
        apiConfig.endpoints.analysisResult(jobId),
        {
          timeout: apiConfig.timeouts.default,
          retryOptions: { maxRetries: 1 },
        }
      )
    },
    async () => {
      await simulateMockDelay(200)
      return getMockAnalysisResults(jobId)
    }
  )
}

/**
 * Cancel running analysis
 */
export async function cancelAnalysis(jobId: string): Promise<void> {
  if (apiConfig.useMockApi) {
    return
  }

  try {
    await httpClient.post(
      `${apiConfig.endpoints.analysisStatus(jobId)}/cancel`,
      {},
      { timeout: apiConfig.timeouts.default }
    )
  } catch (error) {
    console.error('Failed to cancel analysis:', error)
  }
}
