/**
 * Explainability Types
 *
 * Type definitions for AI explainability visualizations.
 * Extensible architecture to support multiple visualization methods.
 */

/**
 * Supported explainability methods
 * Extensible for future methods
 */
export type ExplainabilityMethod =
  | 'gradcam'
  | 'gradcam++'
  | 'scorecam'
  | 'eigencam'
  | 'segmentation'
  | 'saliency'
  | string // Allow custom methods

/**
 * Individual explainability overlay
 */
export interface ExplainabilityOverlay {
  method: ExplainabilityMethod
  image_url: string
  confidence: number
  metadata: {
    model_version: string
    generation_time_ms: number
    [key: string]: unknown
  }
}

/**
 * Explainability viewer configuration
 */
export interface ExplainabilityViewerProps {
  originalImage: string
  overlays: ExplainabilityOverlay[]
  activeOverlay?: ExplainabilityMethod
  onOverlayChange?: (method: ExplainabilityMethod) => void
  title?: string
  description?: string
}

/**
 * Explainability overlay control props
 */
export interface ExplainabilityOverlayProps {
  overlay: ExplainabilityOverlay
  isActive: boolean
  opacity: number
  onOpacityChange: (opacity: number) => void
  onToggle: () => void
  onSelect: () => void
}

/**
 * Heatmap viewer specific configuration
 */
export interface HeatmapViewerProps {
  originalImage: string
  heatmapImage: string
  title?: string
  description?: string
  exportable?: boolean
  onExport?: () => void
}

/**
 * Get display name for explainability method
 */
export function getMethodDisplayName(method: ExplainabilityMethod): string {
  const names: Record<ExplainabilityMethod, string> = {
    gradcam: 'Grad-CAM',
    'gradcam++': 'Grad-CAM++',
    scorecam: 'Score-CAM',
    eigencam: 'EigenCAM',
    segmentation: 'Segmentation Mask',
    saliency: 'Saliency Map',
  }
  return names[method] || method
}

/**
 * Get description for explainability method
 */
export function getMethodDescription(method: ExplainabilityMethod): string {
  const descriptions: Record<ExplainabilityMethod, string> = {
    gradcam:
      'Gradient-based visual explanation showing important regions in the image',
    'gradcam++': 'Improved gradient-based method with better localization',
    scorecam: 'Score-based CAM using class activation maps',
    eigencam: 'EigenCAM using eigenvalues for explanation',
    segmentation: 'Pixel-level segmentation mask',
    saliency: 'Saliency map showing attention regions',
  }
  return descriptions[method] || ''
}

/**
 * Group overlays by method category
 */
export interface OverlayCategory {
  name: string
  methods: ExplainabilityMethod[]
  description?: string
}

export const OVERLAY_CATEGORIES: Record<string, OverlayCategory> = {
  gradient: {
    name: 'Gradient-Based',
    methods: ['gradcam', 'gradcam++'],
    description: 'Methods based on model gradients',
  },
  score: {
    name: 'Score-Based',
    methods: ['scorecam', 'eigencam'],
    description: 'Methods using activation scores',
  },
  segmentation: {
    name: 'Segmentation',
    methods: ['segmentation'],
    description: 'Pixel-level classification',
  },
  saliency: {
    name: 'Attention',
    methods: ['saliency'],
    description: 'Attention-based visualization',
  },
}
