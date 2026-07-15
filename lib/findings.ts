/**
 * V2 — Modality-specific findings with expanded clinical data.
 *
 * buildResult now generates different findings based on the detected
 * modality instead of always returning chest x-ray findings.
 */

export interface Finding {
  label: string
  confidence: number
  tone: 'normal' | 'attention' | 'critical'
}

export interface AnalysisResult {
  patientId: string
  patientName: string
  age: number
  sex: string
  studyType: string
  studyDate: string
  primaryImpression: string
  severity: 'Low' | 'Moderate' | 'Elevated'
  severityTone: 'normal' | 'attention' | 'critical'
  overallConfidence: number
  findings: Finding[]
  summary: string
  nextSteps: string[]
}

interface ModalityTemplate {
  primaryImpression: string
  severity: 'Low' | 'Moderate' | 'Elevated'
  severityTone: 'normal' | 'attention' | 'critical'
  overallConfidence: number
  findings: Finding[]
  summary: string
  nextSteps: string[]
}

const modalityTemplates: Record<string, ModalityTemplate> = {
  'Chest X-Ray': {
    primaryImpression: 'Focal opacity, right lower lobe',
    severity: 'Moderate',
    severityTone: 'attention',
    overallConfidence: 92,
    findings: [
      { label: 'Right lower lobe opacity', confidence: 92, tone: 'attention' },
      { label: 'Consistent with consolidation', confidence: 78, tone: 'attention' },
      { label: 'No pneumothorax', confidence: 97, tone: 'normal' },
      { label: 'Cardiac silhouette normal', confidence: 95, tone: 'normal' },
      { label: 'No pleural effusion', confidence: 89, tone: 'normal' },
    ],
    summary:
      'The model identifies a focal area of increased opacity in the right lower lobe with a morphology consistent with consolidation, which may represent an infective process such as pneumonia. Cardiomediastinal contours are within normal limits and no pneumothorax or large pleural effusion is detected. Clinical correlation is advised.',
    nextSteps: [
      'Correlate with clinical symptoms and inflammatory markers',
      'Consider follow-up radiograph in 4-6 weeks to confirm resolution',
      'Radiologist review recommended before any treatment decision',
    ],
  },
  'Brain MRI': {
    primaryImpression: 'Enhancing lesion, right temporal lobe',
    severity: 'Elevated',
    severityTone: 'critical',
    overallConfidence: 89,
    findings: [
      { label: 'Right temporal enhancing lesion', confidence: 89, tone: 'critical' },
      { label: 'Perilesional edema', confidence: 82, tone: 'attention' },
      { label: 'Mild midline shift (3mm)', confidence: 76, tone: 'attention' },
      { label: 'Ventricle size within normal limits', confidence: 94, tone: 'normal' },
      { label: 'No acute hemorrhage', confidence: 91, tone: 'normal' },
      { label: 'Gray-white differentiation preserved', confidence: 88, tone: 'normal' },
    ],
    summary:
      'An enhancing lesion is identified in the right temporal lobe measuring approximately 2.1 x 1.8 cm, with surrounding perilesional edema and mild midline shift. Differential includes primary neoplasm, metastatic disease, or less likely an atypical infectious process. Urgent neurosurgical consultation is recommended.',
    nextSteps: [
      'Urgent neurosurgical and neuro-oncology consultation',
      'Consider MR spectroscopy or perfusion imaging for further characterization',
      'Full staging CT chest/abdomen/pelvis if metastatic disease suspected',
      'Correlate with clinical history and symptom onset',
    ],
  },
  'Bone Analysis': {
    primaryImpression: 'Distal radius fracture with dorsal angulation',
    severity: 'Moderate',
    severityTone: 'attention',
    overallConfidence: 94,
    findings: [
      { label: 'Distal radius fracture', confidence: 94, tone: 'attention' },
      { label: 'Dorsal angulation (15°)', confidence: 86, tone: 'attention' },
      { label: 'No ulnar styloid fracture', confidence: 91, tone: 'normal' },
      { label: 'Joint alignment maintained', confidence: 88, tone: 'normal' },
      { label: 'Bone density within normal range', confidence: 82, tone: 'normal' },
    ],
    summary:
      'A transverse fracture of the distal radius is identified with approximately 15 degrees of dorsal angulation. The ulnar styloid is intact and carpal alignment is maintained. Bone density appears within normal limits for age. Orthopedic consultation for reduction assessment is advised.',
    nextSteps: [
      'Orthopedic consultation for reduction vs. conservative management',
      'Assess neurovascular status of the hand',
      'Consider CT if intra-articular extension is suspected',
      'Follow-up imaging in 7-10 days post-treatment',
    ],
  },
  'Breast Screening': {
    primaryImpression: 'Irregular mass, upper outer quadrant left breast',
    severity: 'Elevated',
    severityTone: 'critical',
    overallConfidence: 87,
    findings: [
      { label: 'Irregular mass (left UOQ)', confidence: 87, tone: 'critical' },
      { label: 'Spiculated margins', confidence: 79, tone: 'critical' },
      { label: 'Clustered microcalcifications', confidence: 74, tone: 'attention' },
      { label: 'No axillary lymphadenopathy', confidence: 91, tone: 'normal' },
      { label: 'Right breast unremarkable', confidence: 95, tone: 'normal' },
    ],
    summary:
      'An irregular spiculated mass measuring approximately 1.4 cm is identified in the upper outer quadrant of the left breast, with associated clustered microcalcifications. BI-RADS assessment: Category 4C — high suspicion for malignancy. Tissue sampling is strongly recommended.',
    nextSteps: [
      'Core needle biopsy under ultrasound or stereotactic guidance',
      'Diagnostic breast ultrasound for further characterization',
      'Refer to breast surgery team for multidisciplinary assessment',
      'Consider breast MRI for extent of disease evaluation',
    ],
  },
  'Kidney Analysis': {
    primaryImpression: 'Renal calculus, left ureteropelvic junction',
    severity: 'Moderate',
    severityTone: 'attention',
    overallConfidence: 93,
    findings: [
      { label: 'Left UPJ calculus (8mm)', confidence: 93, tone: 'attention' },
      { label: 'Mild left hydronephrosis', confidence: 85, tone: 'attention' },
      { label: 'Right kidney unremarkable', confidence: 96, tone: 'normal' },
      { label: 'No renal mass identified', confidence: 94, tone: 'normal' },
      { label: 'Bladder wall normal thickness', confidence: 90, tone: 'normal' },
    ],
    summary:
      'An 8mm calculus is identified at the left ureteropelvic junction with associated mild proximal hydronephrosis. No additional stones are seen. The right kidney and collecting system appear normal. Urology consultation is recommended given stone size and obstruction.',
    nextSteps: [
      'Urology consultation for management planning',
      'Consider alpha-blocker therapy for medical expulsive therapy',
      'Monitor renal function (BUN/creatinine)',
      'Follow-up imaging in 2-4 weeks if conservative management chosen',
    ],
  },
  'Cardiac CT': {
    primaryImpression: 'Elevated coronary artery calcium score',
    severity: 'Moderate',
    severityTone: 'attention',
    overallConfidence: 91,
    findings: [
      { label: 'Total calcium score: 285 Agatston units', confidence: 91, tone: 'attention' },
      { label: 'LAD artery: moderate calcium', confidence: 88, tone: 'attention' },
      { label: 'RCA: mild calcium', confidence: 84, tone: 'normal' },
      { label: 'Chamber sizes within normal limits', confidence: 93, tone: 'normal' },
      { label: 'No pericardial effusion', confidence: 96, tone: 'normal' },
    ],
    summary:
      'The total Agatston calcium score is 285, placing the patient above the 75th percentile for age and sex. Predominant calcification is seen in the left anterior descending artery. Chamber sizes are within normal limits and there is no pericardial effusion. Cardiovascular risk stratification and preventive cardiology referral are advised.',
    nextSteps: [
      'Cardiology consultation for risk stratification',
      'Optimize cardiovascular risk factors (lipids, BP, diabetes)',
      'Consider stress testing if symptomatic',
      'Initiate statin therapy per current guidelines',
    ],
  },
}

export function buildResult(fileName: string, modality: string): AnalysisResult {
  // V2 — Match modality to template, fallback to Chest X-Ray
  const template = modalityTemplates[modality] || modalityTemplates['Chest X-Ray']

  return {
    patientId: 'MV-' + Math.floor(100000 + Math.random() * 899999),
    patientName: 'Anonymized Patient',
    age: 54,
    sex: 'Female',
    studyType: modality,
    studyDate: new Date().toISOString().slice(0, 10),
    ...template,
  }
}
