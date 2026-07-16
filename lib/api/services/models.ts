/**
 * Models Service
 *
 * Multi-model routing based on scan modality.
 * Automatically selects correct model endpoint for analysis.
 */

import type { Modality, ModelName } from '@/lib/types/api'

/**
 * Model routing configuration
 * Maps modalities to their corresponding models and endpoints
 */
const MODEL_ROUTING: Record<Modality, { model: ModelName; endpoint: string; description: string }> = {
  brain_mri: {
    model: 'brain-tumor',
    endpoint: 'brain-tumor',
    description: 'Brain Tumor Detection (MRI)',
  },
  chest_xray: {
    model: 'pneumonia',
    endpoint: 'pneumonia',
    description: 'Pneumonia Detection (Chest X-Ray)',
  },
  kidney_ct: {
    model: 'kidney',
    endpoint: 'kidney',
    description: 'Kidney Lesion Detection (CT)',
  },
  bone_xray: {
    model: 'fracture',
    endpoint: 'fracture',
    description: 'Fracture Detection (Bone X-Ray)',
  },
  breast_mammogram: {
    model: 'breast-cancer',
    endpoint: 'breast-cancer',
    description: 'Breast Cancer Detection (Mammogram)',
  },
  unknown: {
    model: 'unknown',
    endpoint: 'general',
    description: 'General Medical Image Analysis',
  },
}

/**
 * Get model configuration for a given modality
 */
export function getModelForModality(modality: Modality): {
  model: ModelName
  endpoint: string
  description: string
} {
  return MODEL_ROUTING[modality] || MODEL_ROUTING.unknown
}

/**
 * Get all available models
 */
export function getAllModels() {
  return Object.entries(MODEL_ROUTING).map(([modality, config]) => ({
    modality,
    ...config,
  }))
}

/**
 * Check if modality is supported
 */
export function isModalitySupported(modality: Modality): boolean {
  return modality in MODEL_ROUTING && modality !== 'unknown'
}

/**
 * Get model endpoint from modality
 */
export function getModelEndpoint(modality: Modality): string {
  return getModelForModality(modality).endpoint
}

/**
 * Get model name from modality
 */
export function getModelName(modality: Modality): ModelName {
  return getModelForModality(modality).model
}
