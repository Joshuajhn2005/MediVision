/**
 * API Response Types
 *
 * TypeScript interfaces for all FastAPI backend responses.
 * Ensures type safety across frontend application.
 */

// ============================================================================
// Upload & File Handling
// ============================================================================

export interface UploadResponse {
  file_id: string
  modality: string
  file_size: number
  preprocessing_required: boolean
}

export interface FileValidation {
  valid: boolean
  error?: string
  modality?: string
}

// ============================================================================
// Analysis & Models
// ============================================================================

export type AnalysisStatus =
  | 'waiting'
  | 'uploading'
  | 'preprocessing'
  | 'inference'
  | 'gradcam'
  | 'analysis'
  | 'report'
  | 'complete'
  | 'error'

export type Modality =
  | 'brain_mri'
  | 'chest_xray'
  | 'kidney_ct'
  | 'bone_xray'
  | 'breast_mammogram'
  | 'unknown'

export type ModelName =
  | 'brain-tumor'
  | 'pneumonia'
  | 'kidney'
  | 'fracture'
  | 'breast-cancer'
  | 'unknown'

export interface ModelConfig {
  name: ModelName
  modalities: Modality[]
  description: string
  endpoint: string
}

export interface AnalysisStatusResponse {
  job_id: string
  status: AnalysisStatus
  progress_percent: number
  current_stage: string
  results?: AnalysisResults
  error?: string
  timestamp: number
}

// ============================================================================
// Analysis Results
// ============================================================================

export interface Finding {
  finding: string
  confidence: number
  location?: string
  severity?: 'low' | 'medium' | 'high'
  clinical_note?: string
}

export interface ExplainabilityOverlay {
  method: 'gradcam' | 'gradcam++' | 'scorecam' | 'eigencam' | 'segmentation' | string
  image_url: string
  confidence: number
  metadata: {
    model_version: string
    generation_time_ms: number
    [key: string]: unknown
  }
}

export interface AnalysisResults {
  job_id: string
  file_id: string
  modality: Modality
  model_name: ModelName
  model_version: string
  findings: Finding[]
  overall_confidence: number
  overlays: ExplainabilityOverlay[]
  recommendations: string[]
  analysis_timestamp: number
  processing_time_ms: number
}

// ============================================================================
// Reports
// ============================================================================

export interface ReportData {
  analysis_id: string
  patient_name?: string
  mrn?: string
  age?: number
  gender?: string
  scan_date: string
  modality: Modality
  model_name: ModelName
  findings: string[]
  overall_confidence: number
  recommendations: string[]
  clinical_notes?: string
}

export interface ExportResponse {
  pdf_url: string
  file_name: string
  size_bytes: number
}

// ============================================================================
// History & Patient Data
// ============================================================================

export interface AnalysisHistoryItem {
  analysis_id: string
  file_id: string
  file_name: string
  modality: Modality
  model_name: ModelName
  overall_confidence: number
  timestamp: number
  status: 'complete' | 'failed'
  error?: string
}

export interface PatientProfile {
  patient_id?: string
  name?: string
  mrn?: string
  age?: number
  gender?: 'M' | 'F' | 'Other'
  clinical_history?: string
  symptoms?: string[]
  referring_doctor?: string
}

// ============================================================================
// Comparison & Multi-Analysis
// ============================================================================

export interface AnalysisComparison {
  analysis_ids: string[]
  analyses: AnalysisResults[]
  differences: {
    findings_diff: Finding[]
    confidence_diff: number
  }
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  error: null
}

export interface ApiErrorResponse {
  success: false
  data: null
  error: {
    code: string
    message: string
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
