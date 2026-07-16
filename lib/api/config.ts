/**
 * API Configuration
 *
 * Centralized configuration for FastAPI backend integration.
 * Supports development mock mode and environment-driven settings.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10)
const MAX_FILE_SIZE = parseInt(
  process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '104857600',
  10
) // 100MB default
const UPLOAD_TIMEOUT = parseInt(
  process.env.NEXT_PUBLIC_UPLOAD_TIMEOUT || '60000',
  10
)

export const apiConfig = {
  baseUrl: API_BASE_URL,
  useMockApi: USE_MOCK_API,
  timeouts: {
    default: API_TIMEOUT,
    upload: UPLOAD_TIMEOUT,
    analysis: API_TIMEOUT,
    export: UPLOAD_TIMEOUT, // PDF generation can be slow
  },
  maxFileSize: MAX_FILE_SIZE,
  endpoints: {
    // Upload
    upload: '/api/upload',
    
    // Models
    models: '/api/models',
    
    // Analysis
    analysis: (model: string) => `/api/analyze/${model}`,
    analysisStatus: (jobId: string) => `/api/analysis/${jobId}/status`,
    analysisResult: (jobId: string) => `/api/analysis/${jobId}/result`,
    
    // Reports
    reportExport: (analysisId: string) => `/api/reports/${analysisId}/export`,
  },
  
  // Polling configuration for event stream
  polling: {
    interval: 1500, // ms between status checks
    backoffMultiplier: 1.1,
    maxBackoffInterval: 5000, // max 5s between checks
  },
}

export type ApiConfig = typeof apiConfig
