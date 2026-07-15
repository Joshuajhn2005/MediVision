'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'motion/react'
import {
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Flame,
  Eye,
  AlertTriangle,
  ShieldAlert,
  FileText,
  ArrowRight,
  Sun,
  Contrast,
  Layers,
} from 'lucide-react'
import type { AnalysisResult, Finding } from '@/lib/findings'
import { GlowButton } from '@/components/glow-button'
import type { View } from '@/components/top-nav'
import { cn } from '@/lib/utils'

const toneStyles: Record<Finding['tone'], string> = {
  normal: 'text-emerald',
  attention: 'text-amber',
  critical: 'text-critical',
}

const toneBar: Record<Finding['tone'], string> = {
  normal: 'bg-emerald',
  attention: 'bg-amber',
  critical: 'bg-critical',
}

/**
 * V2 — 3-Panel Radiology Workstation
 *
 * Layout:
 *  Left:   Medical viewer toolbar (pan, zoom, brightness, contrast)
 *  Center: Large AI visualization with animated heatmap
 *  Right:  Clinical Findings + Summary + Recommendations
 *
 * Enhancements:
 *  - Brightness/contrast sliders with CSS filter application
 *  - Segmentation overlay mode
 *  - Animated Grad-CAM reveal (grows from center outward)
 *  - Animated confidence counter
 *  - Breathing heatmap pulse
 *  - Continuous scan laser sweep
 */

function AnimatedConfidence({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const duration = 1200
    const steps = 30
    const stepTime = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = Math.min(step / steps, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (step >= steps) clearInterval(timer)
    }, stepTime)
    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <div ref={ref} className="font-display text-3xl font-semibold text-cyan animate-confidence-glow">
      {display}%
    </div>
  )
}

export function ResultView({
  result,
  onNavigate,
}: {
  result: AnalysisResult
  onNavigate: (v: View) => void
}) {
  const [overlay, setOverlay] = useState<'original' | 'heatmap' | 'segmentation'>('heatmap')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [heatmapRevealed, setHeatmapRevealed] = useState(false)

  // V2 — Animate heatmap reveal
  useEffect(() => {
    const timer = setTimeout(() => setHeatmapRevealed(true), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-5 pt-28 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            Preliminary Assessment
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {result.studyType} Results
          </h1>
        </div>
        <GlowButton variant="outline" onClick={() => onNavigate('report')}>
          <FileText className="h-4 w-4" />
          View Report
        </GlowButton>
      </motion.div>

      {/* V2 — 3-Panel Workstation Layout */}
      <div className="grid gap-5 lg:grid-cols-[auto_1fr_340px]">
        {/* LEFT: Viewer Toolbar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-strong hidden lg:flex flex-col gap-2 rounded-2xl p-3 w-14"
        >
          <ToolbarBtn active={overlay === 'original'} onClick={() => setOverlay('original')} icon={Eye} tooltip="Original" />
          <ToolbarBtn active={overlay === 'heatmap'} onClick={() => setOverlay('heatmap')} icon={Flame} tooltip="Heatmap" />
          <ToolbarBtn active={overlay === 'segmentation'} onClick={() => setOverlay('segmentation')} icon={Layers} tooltip="Segmentation" />
          <div className="h-px bg-white/10 my-1" />
          <ToolbarBtn onClick={() => setZoom((z) => Math.min(2.4, z + 0.2))} icon={ZoomIn} tooltip="Zoom In" />
          <ToolbarBtn onClick={() => setZoom((z) => Math.max(1, z - 0.2))} icon={ZoomOut} tooltip="Zoom Out" />
          <ToolbarBtn active={pan} onClick={() => setPan((p) => !p)} icon={Move} tooltip="Pan" />
          <ToolbarBtn
            onClick={() => { setZoom(1); setPan(false); setBrightness(100); setContrast(100) }}
            icon={RotateCcw}
            tooltip="Reset"
          />
          <div className="h-px bg-white/10 my-1" />
          {/* V2 — Brightness / Contrast sliders */}
          <div className="flex flex-col items-center gap-1.5 px-1">
            <Sun className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="range"
              min={30}
              max={200}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full h-1 accent-cyan appearance-none bg-white/10 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan"
              style={{ writingMode: 'vertical-lr' as any, height: 60 }}
            />
          </div>
          <div className="flex flex-col items-center gap-1.5 px-1">
            <Contrast className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="range"
              min={30}
              max={200}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full h-1 accent-cyan appearance-none bg-white/10 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan"
              style={{ writingMode: 'vertical-lr' as any, height: 60 }}
            />
          </div>
        </motion.div>

        {/* CENTER: Image Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="glass-strong relative overflow-hidden rounded-[1.75rem] p-3"
        >
          {/* Mobile toolbar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 lg:hidden">
            <div className="flex items-center gap-1.5">
              <ViewerBtn active={overlay === 'original'} onClick={() => setOverlay('original')} icon={Eye} label="Original" />
              <ViewerBtn active={overlay === 'heatmap'} onClick={() => setOverlay('heatmap')} icon={Flame} label="Heatmap" />
              <ViewerBtn active={overlay === 'segmentation'} onClick={() => setOverlay('segmentation')} icon={Layers} label="Segment" />
            </div>
            <div className="flex items-center gap-1.5">
              <IconBtn onClick={() => setZoom((z) => Math.min(2.4, z + 0.2))} icon={ZoomIn} />
              <IconBtn onClick={() => setZoom((z) => Math.max(1, z - 0.2))} icon={ZoomOut} />
              <IconBtn active={pan} onClick={() => setPan((p) => !p)} icon={Move} />
              <IconBtn onClick={() => { setZoom(1); setPan(false) }} icon={RotateCcw} />
            </div>
          </div>

          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
            <motion.div
              className="relative h-full w-full"
              animate={{ scale: zoom }}
              drag={pan}
              dragConstraints={{ left: -160, right: 160, top: -160, bottom: 160 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              style={{
                cursor: pan ? 'grab' : 'default',
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              }}
            >
              <Image
                src="/chest-xray.png"
                alt={`${result.studyType} radiograph under analysis`}
                fill
                className="object-cover"
                priority
              />

              {/* Heatmap overlay — V2 with animated reveal */}
              {overlay === 'heatmap' && (
                <>
                  <motion.div
                    className="absolute inset-0 mix-blend-screen"
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{
                      opacity: heatmapRevealed ? 1 : 0,
                      scale: heatmapRevealed ? 1 : 0.3,
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{
                      background:
                        'radial-gradient(circle at 63% 66%, rgba(251,87,121,0.7), rgba(251,191,36,0.4) 22%, rgba(34,211,238,0.15) 40%, transparent 55%)',
                      transformOrigin: '63% 66%',
                    }}
                  />
                  {/* V2 — Breathing heatmap pulse */}
                  <motion.div
                    className="absolute inset-0 mix-blend-screen"
                    animate={{
                      opacity: [0, 0.3, 0],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      background:
                        'radial-gradient(circle at 63% 66%, rgba(251,87,121,0.4), transparent 30%)',
                    }}
                  />
                  {/* Animated abnormality outline — V1 preserved + V2 glow */}
                  <motion.span
                    className="absolute rounded-full border-2 border-critical"
                    style={{
                      left: '54%',
                      top: '57%',
                      width: '20%',
                      height: '20%',
                      boxShadow: '0 0 24px rgba(251,87,121,0.8)',
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: heatmapRevealed ? [0.5, 1, 0.5] : 0,
                      scale: heatmapRevealed ? [1, 1.08, 1] : 0.5,
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                </>
              )}

              {/* V2 — Segmentation overlay */}
              {overlay === 'segmentation' && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ duration: 1 }}
                >
                  {/* Right lung region */}
                  <div
                    className="absolute"
                    style={{
                      left: '20%', top: '25%', width: '28%', height: '45%',
                      background: 'rgba(34,211,238,0.15)',
                      borderRadius: '30% 40% 40% 30%',
                      border: '1px solid rgba(34,211,238,0.3)',
                    }}
                  />
                  {/* Left lung region */}
                  <div
                    className="absolute"
                    style={{
                      left: '52%', top: '25%', width: '28%', height: '45%',
                      background: 'rgba(59,130,246,0.15)',
                      borderRadius: '40% 30% 30% 40%',
                      border: '1px solid rgba(59,130,246,0.3)',
                    }}
                  />
                  {/* Heart silhouette */}
                  <div
                    className="absolute"
                    style={{
                      left: '38%', top: '30%', width: '20%', height: '25%',
                      background: 'rgba(251,87,121,0.15)',
                      borderRadius: '50%',
                      border: '1px solid rgba(251,87,121,0.3)',
                    }}
                  />
                  {/* Abnormality region */}
                  <motion.div
                    className="absolute"
                    style={{
                      left: '55%', top: '55%', width: '18%', height: '18%',
                      background: 'rgba(251,191,36,0.2)',
                      borderRadius: '40%',
                      border: '1.5px solid rgba(251,191,36,0.5)',
                    }}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              )}

              {/* Scan sweep — V1 preserved */}
              <span className="animate-scan-line pointer-events-none absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-cyan/20 to-transparent" />
            </motion.div>

            {/* HUD corner readout — V2 enhanced */}
            <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] leading-4 text-cyan/80">
              <div>MODALITY: {result.studyType.toUpperCase()}</div>
              <div>ZOOM: {zoom.toFixed(1)}x</div>
              <div>OVERLAY: {overlay.toUpperCase()}</div>
              <div>BRI: {brightness}% · CON: {contrast}%</div>
            </div>
            <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-critical/15 px-2 py-1 font-mono text-[10px] text-critical">
              ROI · {result.primaryImpression}
            </div>
            {/* V2 — Timestamp */}
            <div className="pointer-events-none absolute top-3 right-3 font-mono text-[10px] text-muted-foreground/50">
              {result.studyDate} · MedVision AI
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Toggle overlays to inspect Grad-CAM attention and segmentation regions.
          </p>
        </motion.div>

        {/* RIGHT: Findings Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          {/* Primary Impression */}
          <div className="glass-strong rounded-2xl p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
              Primary Impression
            </div>
            <div className="font-display text-base font-semibold text-foreground">
              {result.primaryImpression}
            </div>
          </div>

          {/* Severity + confidence */}
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">
                  Overall Confidence
                </div>
                <AnimatedConfidence value={result.overallConfidence} />
              </div>
              <span
                className={cn(
                  'flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium',
                  toneStyles[result.severityTone],
                )}
              >
                <AlertTriangle className="h-4 w-4" />
                {result.severity} severity
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan to-blue"
                initial={{ width: 0 }}
                animate={{ width: `${result.overallConfidence}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ boxShadow: '0 0 12px rgba(34,211,238,0.5)' }}
              />
            </div>
          </div>

          {/* Findings list */}
          <div className="glass-strong rounded-2xl p-5">
            <h3 className="font-display text-lg font-semibold">AI Findings</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {result.findings.map((f, i) => (
                <motion.li
                  key={f.label}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className={cn('h-1.5 w-1.5 rounded-full', toneBar[f.tone])} />
                      {f.label}
                    </span>
                    <span className={cn('font-mono text-xs', toneStyles[f.tone])}>
                      {f.confidence}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      className={cn('h-full rounded-full', toneBar[f.tone])}
                      initial={{ width: 0 }}
                      animate={{ width: `${f.confidence}%` }}
                      transition={{ duration: 0.9, delay: 0.2 + i * 0.08 }}
                    />
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Clinical summary */}
          <div className="glass-strong rounded-2xl p-5">
            <h3 className="font-display text-lg font-semibold">Clinical Summary</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {result.summary}
            </p>
            <h4 className="mt-4 text-sm font-medium text-surface-foreground">
              Suggested next steps
            </h4>
            <ul className="mt-2 flex flex-col gap-2">
              {result.nextSteps.map((s) => (
                <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Disclaimer — V1 preserved */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 flex items-start gap-3 rounded-2xl border border-amber/25 bg-amber/8 p-4 text-sm text-amber"
      >
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          This is an AI-generated preliminary assessment and should be reviewed by
          a qualified radiologist. It is not a diagnosis and must not be used as
          the sole basis for clinical decisions.
        </p>
      </motion.div>
    </div>
  )
}

/* ——— Sub-components ——— */

function ViewerBtn({ active, onClick, icon: Icon, label }: { active?: boolean; onClick: () => void; icon: typeof Eye; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
        active ? 'bg-cyan/15 text-cyan' : 'bg-white/5 text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

function IconBtn({ active, onClick, icon: Icon }: { active?: boolean; onClick: () => void; icon: typeof Eye }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
        active ? 'bg-cyan/15 text-cyan' : 'bg-white/5 text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function ToolbarBtn({ active, onClick, icon: Icon, tooltip }: { active?: boolean; onClick: () => void; icon: typeof Eye; tooltip: string }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200',
        active ? 'bg-cyan/15 text-cyan glow-ring-cyan' : 'bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/8',
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
