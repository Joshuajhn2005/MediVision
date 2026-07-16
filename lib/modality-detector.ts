import { departments } from '@/lib/departments'
import type { Modality } from '@/lib/types/api'

export interface ModalityResult {
  departmentId: string
  displayName: string
  organKey: string
  modality: string
  apiModality: Modality
  confidence: number
}

/**
 * V2 — Automatic modality detection from filename.
 *
 * Analyzes the filename for medical imaging keywords to determine
 * the imaging modality without requiring manual user selection.
 *
 * Falls back to 'Chest X-Ray' as the most common modality.
 * Now integrates with API modality types for backend routing.
 */

interface Pattern {
  keywords: string[]
  deptId: string
  organKey: string
  apiModality: Modality
}

const patterns: Pattern[] = [
  {
    keywords: ['brain', 'mri', 'neuro', 'cranial', 'head', 'flair', 't1', 't2'],
    deptId: 'brain-mri',
    organKey: 'brain',
    apiModality: 'brain_mri',
  },
  {
    keywords: ['chest', 'lung', 'thorax', 'cxr', 'pa_view', 'ap_view', 'pneumonia'],
    deptId: 'chest-xray',
    organKey: 'lungs',
    apiModality: 'chest_xray',
  },
  {
    keywords: ['bone', 'fracture', 'ortho', 'skeletal', 'wrist', 'femur', 'tibia', 'humerus', 'spine', 'vertebra'],
    deptId: 'bone-xray',
    organKey: 'bones',
    apiModality: 'bone_xray',
  },
  {
    keywords: ['breast', 'mammo', 'mammograph', 'birads', 'calcification'],
    deptId: 'breast-mammo',
    organKey: 'breast',
    apiModality: 'breast_mammogram',
  },
  {
    keywords: ['kidney', 'renal', 'nephro', 'ureter', 'stone', 'hydro'],
    deptId: 'kidney-ct',
    organKey: 'kidneys',
    apiModality: 'kidney_ct',
  },
  {
    keywords: ['cardiac', 'heart', 'coronary', 'aorta', 'cardio', 'calcium_score'],
    deptId: 'cardiac-ct',
    organKey: 'heart',
    apiModality: 'unknown',
  },
]

export function detectModality(fileName: string): ModalityResult {
  const lower = fileName.toLowerCase().replace(/[_\-\.]/g, ' ')

  for (const pattern of patterns) {
    for (const kw of pattern.keywords) {
      if (lower.includes(kw)) {
        const dept = departments.find((d) => d.id === pattern.deptId)
        return {
          departmentId: pattern.deptId,
          displayName: dept?.name ?? pattern.deptId,
          organKey: pattern.organKey,
          modality: dept?.modality ?? 'Unknown',
          apiModality: pattern.apiModality,
          confidence: 0.95,
        }
      }
    }
  }

  // Default fallback: Chest X-Ray
  const defaultDept = departments.find((d) => d.id === 'chest-xray')!
  return {
    departmentId: 'chest-xray',
    displayName: defaultDept.name,
    organKey: 'lungs',
    modality: defaultDept.modality,
    apiModality: 'chest_xray',
    confidence: 0.5, // Lower confidence for fallback
  }
}
