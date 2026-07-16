/**
 * Modality Routing Bridge
 *
 * Bridges existing department-based UI system with API modality routing.
 * Coordinates automatic model selection based on detected modality.
 */

import { detectModality, type ModalityResult } from '@/lib/modality-detector'
import { getModelForModality } from '@/lib/api/services/models'
import type { Modality, ModelName } from '@/lib/types/api'

export interface AnalysisRoute {
  departmentId: string
  displayName: string
  apiModality: Modality
  modelName: ModelName
  modelEndpoint: string
  confidence: number
}

/**
 * Detect modality from filename and get routing information
 */
export function getAnalysisRoute(fileName: string): AnalysisRoute {
  const detectedModality: ModalityResult = detectModality(fileName)

  const modelConfig = getModelForModality(detectedModality.apiModality)

  return {
    departmentId: detectedModality.departmentId,
    displayName: detectedModality.displayName,
    apiModality: detectedModality.apiModality,
    modelName: modelConfig.model,
    modelEndpoint: modelConfig.endpoint,
    confidence: detectedModality.confidence,
  }
}

/**
 * Validate that modality is supported for analysis
 */
export function validateAnalysisRoute(route: AnalysisRoute): { valid: boolean; error?: string } {
  if (!route.apiModality || route.apiModality === 'unknown') {
    return {
      valid: false,
      error: `Unable to determine imaging modality. Please check file name and try again.`,
    }
  }

  if (route.modelEndpoint === 'general') {
    return {
      valid: false,
      error: `This imaging type is not yet supported. Currently supporting: Brain MRI, Chest X-Ray, Bone X-Ray, Breast Mammogram, Kidney CT.`,
    }
  }

  return { valid: true }
}
