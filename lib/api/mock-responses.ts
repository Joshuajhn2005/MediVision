/**
 * Mock API Responses
 *
 * Deterministic mock responses matching exact backend interface.
 * Used when NEXT_PUBLIC_USE_MOCK_API is enabled.
 * Enables frontend development without backend availability.
 */

import type {
  UploadResponse,
  AnalysisStatusResponse,
  AnalysisResults,
  ExportResponse,
  Modality,
  ModelName,
  Finding,
  ExplainabilityOverlay,
} from '@/lib/types/api'

// Storage for in-memory mock state during session
const mockState: Map<string, AnalysisStatusResponse> = new Map()

/**
 * Generate deterministic mock job ID
 */
export function generateMockJobId(): string {
  return `mock-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get mock upload response
 */
export function getMockUploadResponse(fileName: string): UploadResponse {
  const lowerName = fileName.toLowerCase()
  let modality: Modality = 'unknown'

  if (lowerName.includes('brain')) modality = 'brain_mri'
  else if (lowerName.includes('chest')) modality = 'chest_xray'
  else if (lowerName.includes('kidney')) modality = 'kidney_ct'
  else if (lowerName.includes('bone')) modality = 'bone_xray'
  else if (lowerName.includes('breast')) modality = 'breast_mammogram'

  return {
    file_id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    modality,
    file_size: Math.floor(Math.random() * 50000000) + 5000000, // 5-55MB
    preprocessing_required: Math.random() > 0.7,
  }
}

/**
 * Get mock analysis status - progressive stages
 */
export function getMockAnalysisStatus(jobId: string, elapsedMs: number): AnalysisStatusResponse {
  // Simulate realistic analysis progression
  let status: AnalysisStatusResponse

  if (!mockState.has(jobId)) {
    // Initialize new analysis
    status = {
      job_id: jobId,
      status: 'uploading',
      progress_percent: 0,
      current_stage: 'Uploading Scan',
      timestamp: Date.now(),
    }
    mockState.set(jobId, status)
  } else {
    status = mockState.get(jobId)!
  }

  // Simulate progression based on elapsed time
  const stages = [
    { status: 'uploading' as const, duration: 2000, stage: 'Uploading Scan', progress: 15 },
    { status: 'preprocessing' as const, duration: 3000, stage: 'Image Preprocessing', progress: 30 },
    { status: 'inference' as const, duration: 8000, stage: 'Deep CNN Analysis', progress: 60 },
    { status: 'gradcam' as const, duration: 3000, stage: 'Generating Explainability', progress: 75 },
    { status: 'analysis' as const, duration: 2000, stage: 'Clinical Pattern Matching', progress: 85 },
    { status: 'report' as const, duration: 2000, stage: 'Building Report', progress: 95 },
  ]

  let cumulativeMs = 0
  for (const stage of stages) {
    cumulativeMs += stage.duration
    if (elapsedMs < cumulativeMs) {
      const stageProgress = Math.min(
        stage.progress + ((elapsedMs - (cumulativeMs - stage.duration)) / stage.duration) * 10,
        stage.progress + 10
      )
      status = {
        ...status,
        status: stage.status,
        current_stage: stage.stage,
        progress_percent: Math.floor(stageProgress),
        timestamp: Date.now(),
      }
      mockState.set(jobId, status)
      return status
    }
  }

  // Analysis complete
  const mockResults = getMockAnalysisResults(jobId)
  status = {
    ...status,
    status: 'complete',
    current_stage: 'Analysis Complete',
    progress_percent: 100,
    results: mockResults,
    timestamp: Date.now(),
  }
  mockState.set(jobId, status)
  return status
}

/**
 * Get mock analysis results
 */
export function getMockAnalysisResults(jobId: string): AnalysisResults {
  // Deterministic based on job ID
  const seed = jobId.charCodeAt(0)
  const confidenceBase = 0.85 + ((seed % 10) / 100)

  const findings: Finding[] = [
    {
      finding: 'Abnormality detected in region of interest',
      confidence: confidenceBase,
      location: 'Primary lesion area',
      severity: confidenceBase > 0.9 ? 'high' : confidenceBase > 0.8 ? 'medium' : 'low',
      clinical_note: 'Recommendation for further specialist evaluation',
    },
    {
      finding: 'Secondary finding consistent with imaging features',
      confidence: confidenceBase * 0.9,
      location: 'Peripheral area',
      severity: 'low',
      clinical_note: 'Monitor for progression',
    },
  ]

  const gradcamOverlay: ExplainabilityOverlay = {
    method: 'gradcam',
    image_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    confidence: confidenceBase,
    metadata: {
      model_version: '1.0.0',
      generation_time_ms: 2500,
    },
  }

  return {
    job_id: jobId,
    file_id: `file-${jobId.substring(0, 20)}`,
    modality: 'brain_mri',
    model_name: 'brain-tumor',
    model_version: '1.0.0',
    findings,
    overall_confidence: confidenceBase,
    overlays: [gradcamOverlay],
    recommendations: [
      'Clinical correlation is recommended',
      'Consider follow-up imaging in 3-6 months',
      'Patient should discuss results with attending physician',
    ],
    analysis_timestamp: Date.now(),
    processing_time_ms: 20000,
  }
}

/**
 * Get mock export response
 */
export function getMockExportResponse(analysisId: string): ExportResponse {
  return {
    pdf_url: `data:application/pdf;base64,JVBERi0xLjQKCjEgMCBvYmo...`, // Placeholder
    file_name: `analysis-${analysisId}-report.pdf`,
    size_bytes: 1024 * 512, // 512KB
  }
}

/**
 * Simulate async mock operation with configurable delay
 */
export async function simulateMockDelay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Clear mock session state
 */
export function clearMockState(): void {
  mockState.clear()
}
