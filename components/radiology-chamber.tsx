'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AiCore } from '@/components/ai-core'
import { HolographicBody } from '@/components/holographic-body'
import type { AiCoreState } from '@/components/ai-core'

/**
 * V2 — Radiology Intelligence Chamber
 *
 * A full-screen cinematic experience between Upload and Analysis Pipeline.
 * The user enters an immersive AI-powered radiology chamber with a timed
 * 16.5-second sequence:
 *
 *  Phase 0 (0.0s)  — Fade into dark chamber, floor illuminates
 *  Phase 1 (1.5s)  — Calibration arms extend, laser dots appear
 *  Phase 2 (3.5s)  — Scan materializes as hologram, scanner ring spins
 *  Phase 3 (5.5s)  — Modality detected, scan flies to AI Core
 *  Phase 4 (7.0s)  — AI Core powers on, energy pulses
 *  Phase 5 (9.0s)  — Holographic body rises from floor
 *  Phase 6 (11.0s) — Detected organ illuminates, neural energy flows
 *  Phase 7 (13.0s) — All elements pulse in synchrony
 *  Phase 8 (15.0s) — "Analysis Complete" flash
 *  Phase 9 (16.5s) — Fade out, navigate to pipeline
 *
 * Entirely SVG + CSS + Motion — no Three.js.
 */

const chamberMessages = [
  'Initializing Medical Intelligence',
  'Calibrating Scanner',
  'Detecting Modality...',
  '', // filled dynamically
  'Loading Specialized AI Model',
  'Running Deep Learning Inference',
  'Generating Explainability',
  'Preparing Preliminary Findings',
  'Analysis Complete ✓',
]

const phaseTiming = [0, 1500, 3500, 5500, 7000, 9000, 11000, 13000, 15000, 16500]

interface RadiologyChamberProps {
  fileName: string
  detectedModality: string
  detectedOrganKey: string
  onComplete: () => void
}

export function RadiologyChamber({
  fileName,
  detectedModality,
  detectedOrganKey,
  onComplete,
}: RadiologyChamberProps) {
  const [phase, setPhase] = useState(0)

  // Fill in dynamic message
  const messages = useMemo(() => {
    const msgs = [...chamberMessages]
    msgs[3] = `${detectedModality} Detected`
    return msgs
  }, [detectedModality])

  // Phase timer
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    phaseTiming.forEach((time, i) => {
      if (i === 0) return
      timers.push(setTimeout(() => setPhase(i), time))
    })
    // Final: navigate away after fade out completes
    timers.push(setTimeout(onComplete, phaseTiming[phaseTiming.length - 1] + 1500))
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const aiCoreState: AiCoreState =
    phase < 4 ? 'idle' : phase < 6 ? 'scanning' : 'connected'

  const showArms = phase >= 1
  const showScan = phase >= 2 && phase < 4
  const scanToCore = phase >= 3 && phase < 5
  const showBody = phase >= 5
  const organGlow = phase >= 6
  const syncPulse = phase >= 7
  const complete = phase >= 8
  const fadeOut = phase >= 9

  // Calibration arm positions
  const arms = [
    { x1: 0, y1: 0, x2: 120, y2: 120, origin: 'top-left' },
    { x1: 500, y1: 0, x2: 380, y2: 120, origin: 'top-right' },
    { x1: 0, y1: 500, x2: 120, y2: 380, origin: 'bottom-left' },
    { x1: 500, y1: 500, x2: 380, y2: 380, origin: 'bottom-right' },
  ]

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          key="chamber"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#020610' }}
          data-r3f-placeholder="radiology-chamber"
          data-sound="chamber-enter"
        >
          {/* ——— Chamber Floor Grid ——— */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 0 ? 1 : 0 }}
              transition={{ duration: 2 }}
              className="w-full h-[50%]"
              style={{ perspective: '600px' }}
            >
              <div
                className="w-full h-full animate-floor-grid-pulse"
                style={{
                  transform: 'rotateX(68deg)',
                  transformOrigin: 'center top',
                  backgroundImage:
                    'radial-gradient(circle at 50% 0%, rgba(34,211,238,0.06) 0%, transparent 60%), linear-gradient(rgba(34,211,238,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.12) 1px, transparent 1px)',
                  backgroundSize: '100% 100%, 40px 40px, 40px 40px',
                }}
              />
            </motion.div>
          </div>

          {/* ——— Ambient volumetric light columns ——— */}
          <div className="absolute inset-0 pointer-events-none">
            {[15, 35, 65, 85].map((left, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0"
                style={{
                  left: `${left}%`,
                  width: '2px',
                  height: '60%',
                  background: 'linear-gradient(to top, rgba(34,211,238,0.15), transparent)',
                  filter: 'blur(6px)',
                }}
                animate={{
                  opacity: phase >= 4 ? [0.3, 0.7, 0.3] : [0.05, 0.15, 0.05],
                  height: phase >= 4 ? ['50%', '70%', '50%'] : '60%',
                }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>

          {/* ——— Massive MRI Scanner Ring (behind everything) ——— */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: phase >= 2 ? 0.6 : 0.15,
                scale: 1,
                rotate: phase >= 2 ? 360 : 0,
              }}
              transition={{
                opacity: { duration: 1 },
                scale: { duration: 2 },
                rotate: { duration: phase >= 2 ? 12 : 40, repeat: Infinity, ease: 'linear' },
              }}
              style={{ perspective: '800px' }}
            >
              <svg width="600" height="600" viewBox="0 0 600 600" className="opacity-60">
                <defs>
                  <linearGradient id="chamberRingGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <circle cx="300" cy="300" r="280" fill="none" stroke="url(#chamberRingGrad)" strokeWidth="2" strokeDasharray="12 8" />
                <circle cx="300" cy="300" r="260" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="1" strokeDasharray="4 16" />
                <circle cx="300" cy="300" r="240" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="0.5" />
                {/* Ring detail marks */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 15 * Math.PI) / 180
                  const x1 = 300 + Math.cos(angle) * 270
                  const y1 = 300 + Math.sin(angle) * 270
                  const x2 = 300 + Math.cos(angle) * 290
                  const y2 = 300 + Math.sin(angle) * 290
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(34,211,238,0.3)" strokeWidth={i % 6 === 0 ? 2 : 0.5} />
                  )
                })}
              </svg>
            </motion.div>
          </div>

          {/* ——— Floating Dust Particles ——— */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  width: 1 + Math.random() * 2,
                  height: 1 + Math.random() * 2,
                  background: 'rgba(34,211,238,0.5)',
                }}
                animate={{
                  y: [0, -(20 + Math.random() * 40), 0],
                  x: [0, (Math.random() - 0.5) * 30, 0],
                  opacity: [0, 0.7, 0],
                }}
                transition={{
                  duration: 8 + Math.random() * 10,
                  repeat: Infinity,
                  delay: Math.random() * 6,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* ——— Calibration Arms ——— */}
          <AnimatePresence>
            {showArms && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 500 500"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="armGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(34,211,238,0.1)" />
                    <stop offset="100%" stopColor="rgba(34,211,238,0.6)" />
                  </linearGradient>
                </defs>
                {arms.map((arm, i) => (
                  <motion.g key={i}>
                    <motion.line
                      x1={arm.x1}
                      y1={arm.y1}
                      x2={arm.x1}
                      y2={arm.y1}
                      stroke="url(#armGrad)"
                      strokeWidth={2}
                      initial={{ x2: arm.x1, y2: arm.y1 }}
                      animate={{ x2: arm.x2, y2: arm.y2 }}
                      transition={{ duration: 1, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                    />
                    {/* Laser dot at tip */}
                    <motion.circle
                      cx={arm.x2}
                      cy={arm.y2}
                      r={3}
                      fill="#fb5779"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.5, 1] }}
                      transition={{ duration: 1.5, delay: 0.8 + i * 0.1, repeat: Infinity }}
                      style={{ filter: 'drop-shadow(0 0 6px rgba(251,87,121,0.8))' }}
                    />
                  </motion.g>
                ))}
                {/* Center targeting crosshair */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase >= 2 ? 0.6 : 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <line x1="240" y1="250" x2="260" y2="250" stroke="#22d3ee" strokeWidth={1} />
                  <line x1="250" y1="240" x2="250" y2="260" stroke="#22d3ee" strokeWidth={1} />
                  <circle cx="250" cy="250" r="12" fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth={0.5} />
                </motion.g>
              </svg>
            )}
          </AnimatePresence>

          {/* ——— Floating Scan Hologram ——— */}
          <AnimatePresence>
            {showScan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 40 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  ...(scanToCore ? { x: 80, y: -40, scale: 0.6, opacity: 0.5 } : {}),
                }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute z-20 flex flex-col items-center"
              >
                <div
                  className="relative overflow-hidden rounded-xl border border-cyan/30"
                  style={{
                    width: 160,
                    height: 160,
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(59,130,246,0.05))',
                    boxShadow: '0 0 40px rgba(34,211,238,0.3), inset 0 0 20px rgba(34,211,238,0.1)',
                  }}
                >
                  {/* Scan image placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="font-mono text-xs text-cyan/60 text-center leading-tight">
                      <div className="text-2xl mb-1">🫁</div>
                      {fileName}
                    </div>
                  </div>
                  {/* Scan line effect */}
                  <div className="animate-scan-line absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-cyan/30 to-transparent" />
                  {/* Holographic noise */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.05) 2px, rgba(34,211,238,0.05) 4px)',
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ——— AI Core Sphere ——— */}
          <motion.div
            className="absolute z-30"
            style={{ right: '28%', top: '25%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0.3 }}
            transition={{ duration: 1 }}
          >
            <AiCore state={aiCoreState} size={phase >= 4 ? 90 : 60} />
          </motion.div>

          {/* ——— Holographic Body Rising ——— */}
          <AnimatePresence>
            {showBody && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute z-20 left-[15%] sm:left-[22%]"
                style={{ bottom: '15%' }}
              >
                <HolographicBody
                  highlightOrgan={organGlow ? detectedOrganKey : undefined}
                  riseAnimation
                  compact
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ——— Neural Energy Flow (Scan → Core → Organ) ——— */}
          {organGlow && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-25">
              <defs>
                <linearGradient id="neuralFlowGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              {/* Flow line 1: scan area to AI Core */}
              <motion.line
                x1="50%" y1="50%"
                x2="72%" y2="30%"
                stroke="url(#neuralFlowGrad)"
                strokeWidth={1.5}
                strokeDasharray="8 6"
                animate={{ strokeDashoffset: [80, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ filter: 'drop-shadow(0 0 4px rgba(34,211,238,0.6))' }}
              />
              {/* Flow line 2: AI Core to organ area */}
              <motion.line
                x1="72%" y1="35%"
                x2="30%" y2="55%"
                stroke="url(#neuralFlowGrad)"
                strokeWidth={1.5}
                strokeDasharray="8 6"
                animate={{ strokeDashoffset: [80, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.6))' }}
              />
              {/* Energy pulse particles along the flow */}
              {[1, 2, 3].map((i) => (
                <motion.circle
                  key={i}
                  r={2}
                  fill="#22d3ee"
                  style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }}
                  animate={{
                    cx: ['50%', '72%', '30%'],
                    cy: ['50%', '32%', '55%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: 'linear',
                  }}
                />
              ))}
            </svg>
          )}

          {/* ——— Sync Pulse Ring (phase 7) ——— */}
          {syncPulse && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-cyan/30"
                  style={{ width: 200, height: 200 }}
                  animate={{
                    scale: [1, 3],
                    opacity: [0.4, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* ——— Analysis Complete Flash ——— */}
          {complete && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 1 }}
              style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.2), transparent 60%)' }}
            />
          )}

          {/* ——— System Messages ——— */}
          <div className="absolute bottom-[12%] left-0 right-0 flex flex-col items-center z-40">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="font-mono text-sm uppercase tracking-[0.25em] text-cyan mb-2">
                  {messages[phase] || ''}
                  {phase <= 2 && (
                    <span className="animate-cursor-blink ml-1">▎</span>
                  )}
                </div>
                {/* Phase indicator */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {phaseTiming.slice(0, -1).map((_, i) => (
                    <motion.div
                      key={i}
                      className="rounded-full"
                      style={{
                        width: i === phase ? 16 : 4,
                        height: 4,
                        background: i <= phase ? '#22d3ee' : 'rgba(34,211,238,0.2)',
                        boxShadow: i === phase ? '0 0 8px rgba(34,211,238,0.8)' : 'none',
                      }}
                      layout
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Modality badge */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/8 px-4 py-2 text-sm font-medium text-cyan"
                  style={{ boxShadow: '0 0 20px rgba(34,211,238,0.3)' }}
                >
                  <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
                  {detectedModality}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ——— Top HUD ——— */}
          <div className="absolute top-6 left-6 z-40 font-mono text-[10px] text-cyan/50 leading-5">
            <div>MEDVISION AI v2.0</div>
            <div>CHAMBER: ACTIVE</div>
            <div>FILE: {fileName}</div>
          </div>
          <div className="absolute top-6 right-6 z-40 font-mono text-[10px] text-cyan/50 leading-5 text-right">
            <div>PHASE: {phase + 1}/9</div>
            <div>STATUS: {complete ? 'COMPLETE' : 'PROCESSING'}</div>
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
              ● LIVE
            </motion.div>
          </div>

          {/* ——— Sound architecture placeholders ——— */}
          <div className="hidden" data-sound="chamber-enter" />
          <div className="hidden" data-sound="laser-calibrate" />
          <div className="hidden" data-sound="modality-detected" />
          <div className="hidden" data-sound="ai-complete" />
          <div className="hidden" data-sound="chamber-exit" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
