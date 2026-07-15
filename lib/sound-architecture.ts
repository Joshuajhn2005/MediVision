/**
 * V2 — Sound Architecture
 *
 * Placeholder system for future audio integration.
 * Defines the event map and hook interface.
 * No actual audio implementation — only architecture and data attributes.
 */

export type SoundEvent =
  | 'scanner-activate'
  | 'laser-calibrate'
  | 'modality-detected'
  | 'ai-complete'
  | 'upload-success'
  | 'report-generated'
  | 'chamber-enter'
  | 'chamber-exit'
  | 'button-hover'
  | 'button-click'
  | 'step-complete'
  | 'organ-hover'

/**
 * Sound event metadata for future audio engine integration.
 * Each event maps to a planned audio file and volume level.
 */
export const soundMap: Record<SoundEvent, { file: string; volume: number; description: string }> = {
  'scanner-activate': {
    file: '/sounds/scanner-activate.mp3',
    volume: 0.6,
    description: 'MRI scanner powering on — low hum with mechanical whir',
  },
  'laser-calibrate': {
    file: '/sounds/laser-calibrate.mp3',
    volume: 0.4,
    description: 'Precision laser alignment — subtle electronic chirp',
  },
  'modality-detected': {
    file: '/sounds/modality-detected.mp3',
    volume: 0.5,
    description: 'AI confirmation tone — two-note ascending chime',
  },
  'ai-complete': {
    file: '/sounds/ai-complete.mp3',
    volume: 0.7,
    description: 'Analysis complete — satisfying completion sound',
  },
  'upload-success': {
    file: '/sounds/upload-success.mp3',
    volume: 0.4,
    description: 'File accepted — soft positive notification',
  },
  'report-generated': {
    file: '/sounds/report-generated.mp3',
    volume: 0.5,
    description: 'Report ready — document materialization sound',
  },
  'chamber-enter': {
    file: '/sounds/chamber-enter.mp3',
    volume: 0.6,
    description: 'Entering radiology chamber — ambient room activation',
  },
  'chamber-exit': {
    file: '/sounds/chamber-exit.mp3',
    volume: 0.4,
    description: 'Exiting chamber — gentle fade-out whoosh',
  },
  'button-hover': {
    file: '/sounds/button-hover.mp3',
    volume: 0.15,
    description: 'Button hover — subtle haptic tick',
  },
  'button-click': {
    file: '/sounds/button-click.mp3',
    volume: 0.3,
    description: 'Button click — satisfying press sound',
  },
  'step-complete': {
    file: '/sounds/step-complete.mp3',
    volume: 0.3,
    description: 'Pipeline step completed — micro confirmation',
  },
  'organ-hover': {
    file: '/sounds/organ-hover.mp3',
    volume: 0.2,
    description: 'Organ highlighted — soft biological pulse',
  },
}

/**
 * Placeholder hook for triggering sound effects.
 *
 * Usage:
 *   const playSound = useSoundEffect()
 *   playSound('scanner-activate')
 *
 * Currently a no-op. Will be connected to Web Audio API
 * or Howler.js in a future iteration.
 */
export function useSoundEffect() {
  return (_event: SoundEvent) => {
    // No-op placeholder — future audio implementation
    // console.log(`[Sound] ${event}`, soundMap[event])
  }
}

/**
 * Helper to get data attributes for sound-enabled elements.
 *
 * Usage:
 *   <button {...soundAttrs('button-click')}>
 */
export function soundAttrs(event: SoundEvent) {
  return { 'data-sound': event } as const
}
