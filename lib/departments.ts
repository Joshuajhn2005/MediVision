import {
  Brain,
  Activity,
  Bone,
  HeartPulse,
  Ribbon,
  Droplets,
  type LucideIcon,
} from 'lucide-react'

export type Severity = 'normal' | 'attention' | 'critical'

export interface Department {
  id: string
  name: string
  modality: string
  icon: LucideIcon
  accent: 'cyan' | 'blue' | 'purple' | 'emerald'
  status: string
  statusTone: Severity
  blurb: string
  scans: string
}

export const departments: Department[] = [
  {
    id: 'brain-mri',
    name: 'Brain MRI',
    modality: 'Magnetic Resonance',
    icon: Brain,
    accent: 'purple',
    status: 'Online',
    statusTone: 'normal',
    blurb: 'Tumor, lesion & hemorrhage detection with volumetric mapping.',
    scans: '12,480',
  },
  {
    id: 'chest-xray',
    name: 'Chest X-Ray',
    modality: 'Radiography',
    icon: Activity,
    accent: 'cyan',
    status: 'Online',
    statusTone: 'normal',
    blurb: 'Pneumonia, effusion & nodule screening across 14 pathologies.',
    scans: '38,210',
  },
  {
    id: 'bone-xray',
    name: 'Bone Analysis',
    modality: 'Radiography',
    icon: Bone,
    accent: 'blue',
    status: 'Online',
    statusTone: 'normal',
    blurb: 'Fracture localization and bone-density estimation.',
    scans: '9,905',
  },
  {
    id: 'breast-mammo',
    name: 'Breast Screening',
    modality: 'Mammography',
    icon: Ribbon,
    accent: 'purple',
    status: 'Calibrating',
    statusTone: 'attention',
    blurb: 'Mass & micro-calcification detection with BI-RADS support.',
    scans: '6,742',
  },
  {
    id: 'kidney-ct',
    name: 'Kidney Analysis',
    modality: 'CT Scan',
    icon: Droplets,
    accent: 'emerald',
    status: 'Online',
    statusTone: 'normal',
    blurb: 'Stone, cyst & tumor segmentation with size profiling.',
    scans: '5,318',
  },
  {
    id: 'cardiac-ct',
    name: 'Cardiac CT',
    modality: 'CT Angiography',
    icon: HeartPulse,
    accent: 'cyan',
    status: 'Online',
    statusTone: 'normal',
    blurb: 'Coronary calcium scoring and chamber assessment.',
    scans: '4,096',
  },
]

export const accentHex: Record<Department['accent'], string> = {
  cyan: '#22d3ee',
  blue: '#3b82f6',
  purple: '#a78bfa',
  emerald: '#34d399',
}
