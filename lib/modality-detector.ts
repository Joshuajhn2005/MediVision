import { departments } from '@/lib/departments'

export interface ModalityResult {
  departmentId: string
  displayName: string
  organKey: string
  modality: string
}

/**
 * V2 — Automatic modality detection from filename.
 *
 * Analyzes the filename for medical imaging keywords to determine
 * the imaging modality without requiring manual user selection.
 *
 * Falls back to 'Chest X-Ray' as the most common modality.
 */

const patterns: { keywords: string[]; deptId: string; organKey: string }[] = [
  { keywords: ['brain', 'mri', 'neuro', 'cranial', 'head', 'flair', 't1', 't2'], deptId: 'brain-mri', organKey: 'brain' },
  { keywords: ['chest', 'lung', 'thorax', 'cxr', 'pa_view', 'ap_view', 'pneumonia'], deptId: 'chest-xray', organKey: 'lungs' },
  { keywords: ['bone', 'fracture', 'ortho', 'skeletal', 'wrist', 'femur', 'tibia', 'humerus', 'spine', 'vertebra'], deptId: 'bone-xray', organKey: 'bones' },
  { keywords: ['breast', 'mammo', 'mammograph', 'birads', 'calcification'], deptId: 'breast-mammo', organKey: 'breast' },
  { keywords: ['kidney', 'renal', 'nephro', 'ureter', 'stone', 'hydro'], deptId: 'kidney-ct', organKey: 'kidneys' },
  { keywords: ['cardiac', 'heart', 'coronary', 'aorta', 'cardio', 'calcium_score'], deptId: 'cardiac-ct', organKey: 'heart' },
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
  }
}
