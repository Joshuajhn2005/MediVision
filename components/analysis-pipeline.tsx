'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  UploadCloud,
  Wand2,
  Waves,
  BrainCircuit,
  Layers3,
  FileScan,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ScanEye,
  Cpu,
  BarChart3,
  FileText,
  Zap,
} from 'lucide-react'
import { AiCore } from '@/components/ai-core'

/**
 * V2 — 12-Stage AI Analysis Pipeline with Live Thinking Panel.
 *
 * Extended from 7 → 12 stages. Features:
 *  - AI Core visualization at top
 *  - Neural link connections between active step and AI Core
 *  - Energy pulse animations along the pipeline rail
 *  - Live AI Thinking panel with layer progression + confidence counter
 *  - Enhanced progress bar with glow trail
 *  - Pulse ring emission on step completion
 */

const steps = [
  { label: 'Uploading Scan', icon: UploadCloud },
  { label: 'Medical Image Validation', icon: ShieldCheck },
  { label: 'Modality Detection', icon: ScanEye },
  { label: 'Image Preprocessing', icon: Wand2 },
  { label: 'Feature Extraction', icon: Layers3 },
  { label: 'Deep CNN Analysis', icon: BrainCircuit },
  { label: 'Grad-CAM Explainability', icon: Waves },
  { label: 'Clinical Pattern Matching', icon: Cpu },
  { label: 'Confidence Calibration', icon: BarChart3 },
  { label: 'Generating Findings', icon: FileScan },
  { label: 'Building Report', icon: FileText },
  { label: 'Analysis Complete', icon: CheckCircle2 },
]

const STEP_MS = 900

// V2 — Confidence animation keyframes
const confidenceStages = [0, 12, 24, 36, 48, 58, 67, 71, 78, 84, 89, 92, 95, 97, 99]

// V2 — AI layer names for live thinking display
const layerNames = [
  'Conv2D_1 (64 filters)',
  'BatchNorm + ReLU',
  'Conv2D_2 (128 filters)',
  'MaxPool2D',
  'Conv2D_3 (256 filters)',
  'ResBlock_1',
  'Conv2D_4 (512 filters)',
  'ResBlock_2',
  'GlobalAvgPool',
  'Dense_1 (1024)',
  'Dropout (0.3)',
  'Dense_2 (Softmax)',
]

export function AnalysisPipeline({
  fileName,
  onComplete,
}: {
  fileName: string
  onComplete: () => void
}) {
  const [active, setActive] = useState(0)
  const [confidence, setConfidence] = useState(0)
  const [currentLayer, setCurrentLayer] = useState(0)

  useEffect(() => {
    if (active >= steps.length - 1) {
      const done = setTimeout(onComplete, 1200)
      return () => clearTimeout(done)
    }
    const t = setTimeout(() => setActive((s) => s + 1), STEP_MS)
    return () => clearTimeout(t)
  }, [active, onComplete])

  // V2 — Animate confidence
  useEffect(() => {
    const confIdx = Math.min(
      Math.floor((active / (steps.length - 1)) * confidenceStages.length),
      confidenceStages.length - 1
    )
    const target = confidenceStages[confIdx]
    // Smooth count to target
    const step = () => {
      setConfidence((prev) => {
        if (prev >= target) return target
        return prev + 1
      })
    }
    const interval = setInterval(step, 30)
    return () => clearInterval(interval)
  }, [active])

  // V2 — Cycle through layers
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentLayer((l) => (l + 1) % layerNames.length)
    }, 600)
    return () => clearInterval(t)
  }, [])

  const progress = Math.round((active / (steps.length - 1)) * 100)

  // V2 — Completed steps emit pulse rings
  const completedPulses = useMemo(() => {
    return Array.from({ length: active }).map((_, i) => i)
  }, [active])

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-5 pt-28 pb-16">
      {/* V2 — AI Core at top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-6"
      >
        <AiCore
          state={active >= steps.length - 1 ? 'connected' : active > 2 ? 'scanning' : 'idle'}
          size={50}
        />
      </motion.div>

      <div className="mb-8 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
          Neural Pipeline
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Analyzing <span className="text-cyan">{fileName}</span>
        </h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          {progress}% · inference in progress
        </p>
      </div>

      {/* V2 — Enhanced progress rail with glow trail */}
      <div className="relative mb-8 h-1.5 w-full max-w-lg overflow-hidden rounded-full bg-white/8">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan via-blue to-purple"
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut' }}
          style={{ boxShadow: '0 0 20px rgba(34,211,238,0.7), 0 0 40px rgba(34,211,238,0.3)' }}
        />
        {/* Particle at leading edge */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white"
          animate={{ left: `${Math.max(0, progress - 1)}%` }}
          transition={{ ease: 'easeOut' }}
          style={{
            boxShadow: '0 0 12px 4px rgba(34,211,238,1)',
            filter: 'blur(0.5px)',
          }}
        />
      </div>

      <div className="flex w-full gap-6 flex-col lg:flex-row">
        {/* Steps — left column */}
        <ol className="flex w-full lg:w-[60%] flex-col gap-2.5">
          {steps.map((step, i) => {
            const state =
              i < active ? 'done' : i === active ? 'active' : 'pending'
            const Icon = step.icon
            return (
              <motion.li
                key={step.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass relative flex items-center gap-4 overflow-hidden rounded-2xl px-5 py-3.5 transition-all duration-500 ${
                  state === 'active' ? 'glow-ring-cyan' : ''
                } ${state === 'pending' ? 'opacity-40' : ''}`}
              >
                {state === 'active' && (
                  <span className="animate-scan-line absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-cyan/15 to-transparent" />
                )}
                {/* V2 — Pulse ring on completion */}
                {state === 'done' && (
                  <motion.span
                    className="absolute inset-0 rounded-2xl border border-emerald/30"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.05, opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  />
                )}
                <span
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    state === 'done'
                      ? 'bg-emerald/15 text-emerald'
                      : state === 'active'
                        ? 'bg-cyan/15 text-cyan'
                        : 'bg-white/5 text-muted-foreground'
                  }`}
                >
                  {state === 'done' ? (
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  ) : state === 'active' ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <Icon className="h-4.5 w-4.5" />
                  )}
                </span>
                <span
                  className={`relative z-10 text-sm font-medium ${
                    state === 'pending' ? 'text-muted-foreground' : ''
                  }`}
                >
                  {step.label}
                </span>
                {state === 'active' && (
                  <span className="relative z-10 ml-auto font-mono text-xs text-cyan">
                    processing
                  </span>
                )}
                {state === 'done' && (
                  <span className="relative z-10 ml-auto font-mono text-xs text-emerald">
                    ok
                  </span>
                )}
              </motion.li>
            )
          })}
        </ol>

        {/* V2 — Live AI Thinking Panel — right column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full lg:w-[40%] flex flex-col gap-4"
        >
          {/* Confidence display */}
          <div className="glass-strong rounded-2xl p-5 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
              AI Confidence
            </div>
            <motion.div
              className="font-display text-5xl font-bold text-cyan animate-confidence-glow"
              key={confidence}
            >
              {confidence}%
            </motion.div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan to-blue"
                animate={{ width: `${confidence}%` }}
                transition={{ ease: 'easeOut', duration: 0.3 }}
                style={{ boxShadow: '0 0 12px rgba(34,211,238,0.6)' }}
              />
            </div>
          </div>

          {/* Layer progression */}
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">
                Neural Layers
              </span>
              <span className="font-mono text-xs text-cyan">
                {Math.min(currentLayer + 1, layerNames.length)}/{layerNames.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {layerNames.map((name, i) => {
                const isDone = i < currentLayer
                const isCurrent = i === currentLayer
                return (
                  <div
                    key={name}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-mono transition-all duration-300 ${
                      isCurrent
                        ? 'bg-cyan/10 text-cyan'
                        : isDone
                          ? 'text-emerald/70'
                          : 'text-muted-foreground/40'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      isCurrent ? 'bg-cyan animate-pulse' : isDone ? 'bg-emerald/60' : 'bg-muted-foreground/20'
                    }`} />
                    {name}
                    {isCurrent && <Zap className="ml-auto h-3 w-3 text-cyan" />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Feature / Attention maps placeholder */}
          <div className="glass-strong rounded-2xl p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
              Active Maps
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Feature Map', 'Attention Map', 'Activation', 'Gradient'].map((name, i) => (
                <motion.div
                  key={name}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-white/3 p-3"
                  animate={{
                    opacity: active > i + 3 ? 1 : 0.3,
                    borderColor: active > i + 3 ? 'rgba(34,211,238,0.2)' : 'transparent',
                  }}
                  style={{ border: '1px solid transparent' }}
                >
                  {/* Visual placeholder — animated gradient square */}
                  <motion.div
                    className="h-12 w-12 rounded-lg overflow-hidden"
                    style={{
                      background: active > i + 3
                        ? `radial-gradient(circle at ${30 + i * 15}% ${40 + i * 10}%, rgba(251,87,121,0.6), rgba(34,211,238,0.2) 50%, transparent 70%)`
                        : 'rgba(255,255,255,0.03)',
                    }}
                    animate={active > i + 3 ? { opacity: [0.5, 1, 0.5] } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    {active > i + 3 && (
                      <div className="animate-scan-line h-4 bg-gradient-to-b from-transparent via-cyan/30 to-transparent" />
                    )}
                  </motion.div>
                  <span className="text-[10px] text-muted-foreground">{name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
