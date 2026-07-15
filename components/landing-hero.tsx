'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import {
  ArrowRight,
  ShieldCheck,
  Gauge,
  Layers,
  Sparkles,
  Brain,
  ScanEye,
} from 'lucide-react'
import { HolographicBody } from '@/components/holographic-body'
import { AiCore } from '@/components/ai-core'
import { GlowButton } from '@/components/glow-button'
import type { View } from '@/components/top-nav'

const stats = [
  { value: 6, label: 'Imaging modalities', suffix: '' },
  { value: 12, label: 'Avg. inference time', prefix: '<', suffix: 's' },
  { value: 94.6, label: 'Validation accuracy', suffix: '%' },
  { value: 76, label: 'Scans processed', suffix: 'K+' },
]

const features = [
  {
    icon: ScanEye,
    title: 'Explainable Heatmaps',
    body: 'Grad-CAM attention overlays reveal exactly where the model is looking, building radiologist trust.',
    accent: 'text-cyan',
  },
  {
    icon: Gauge,
    title: 'Confidence Scoring',
    body: 'Every finding ships with calibrated confidence and severity so triage decisions are instant.',
    accent: 'text-blue',
  },
  {
    icon: Layers,
    title: 'Multi-Specialty Engine',
    body: 'A unified pipeline spanning MRI, CT, mammography and radiography under one console.',
    accent: 'text-purple',
  },
  {
    icon: ShieldCheck,
    title: 'Clinician-in-the-Loop',
    body: 'Preliminary findings only. Designed to augment — never replace — expert review.',
    accent: 'text-emerald',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

/** V2 — Animated counter that counts up when in view */
function AnimatedStat({ stat }: { stat: typeof stats[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const target = stat.value
    const isFloat = target % 1 !== 0
    const duration = 1600
    const steps = 40
    const stepTime = duration / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = Math.min(step / steps, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(isFloat ? parseFloat((eased * target).toFixed(1)) : Math.round(eased * target))
      if (step >= steps) clearInterval(timer)
    }, stepTime)

    return () => clearInterval(timer)
  }, [isInView, stat.value])

  return (
    <div ref={ref} className="px-4 py-6">
      <div className="font-display text-2xl font-semibold text-cyan sm:text-3xl animate-confidence-glow">
        {stat.prefix || ''}{display}{stat.suffix}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
    </div>
  )
}

export function LandingHero({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="relative mx-auto max-w-6xl px-5">
      {/* HERO */}
      <section className="relative flex min-h-screen flex-col items-center justify-center pt-28 pb-16 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-surface-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan" />
          Deep-learning radiology, reimagined for 2035
        </motion.span>

        {/* V2 — Body + AI Core side by side */}
        <div className="relative mb-4 flex items-center justify-center gap-0">
          <HolographicBody />
          {/* AI Core floating to the right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
            className="absolute -right-8 top-1/4 hidden md:block"
          >
            <AiCore state="idle" size={70} />
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          AI Radiology
          <span className="text-glow-cyan block bg-gradient-to-r from-cyan via-blue to-purple bg-clip-text text-transparent">
            Intelligence
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Instant preliminary scan analysis powered by deep learning. Upload a
          study and watch the pipeline light up in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <GlowButton onClick={() => onNavigate('upload')}>
            Begin Analysis
            <ArrowRight className="h-4 w-4" />
          </GlowButton>
          <GlowButton variant="outline" onClick={() => onNavigate('dashboard')}>
            <Brain className="h-4 w-4" />
            Explore Departments
          </GlowButton>
        </motion.div>

        {/* Stats strip — V2 with animated counters */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="glass mt-16 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-3xl sm:grid-cols-4"
        >
          {stats.map((s) => (
            <AnimatedStat key={s.label} stat={s} />
          ))}
        </motion.div>
      </section>

      {/* FLOATING FEATURE SECTIONS — V1 preserved */}
      <section className="relative py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            A console built for trust
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-muted-foreground">
            Every layer of the platform is engineered to keep the radiologist in
            command.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              whileHover={{ y: -6 }}
              className="glass group relative overflow-hidden rounded-3xl p-7"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-40" />
              <f.icon className={`h-7 w-7 ${f.accent}`} />
              <h3 className="mt-5 font-display text-lg font-semibold">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </motion.article>
          ))}
        </div>

        {/* CTA band — V1 preserved */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-strong glow-ring-cyan relative mt-16 overflow-hidden rounded-[2rem] px-8 py-14 text-center"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="animate-scan-line absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-cyan/10 to-transparent" />
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to analyze your first scan?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Drag in a study and let the neural pipeline surface preliminary
            findings in seconds.
          </p>
          <div className="mt-8 flex justify-center">
            <GlowButton onClick={() => onNavigate('upload')}>
              Launch Scanner
              <ArrowRight className="h-4 w-4" />
            </GlowButton>
          </div>
        </motion.div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          MedVision AI provides preliminary findings only and is not a substitute
          for professional medical diagnosis.
        </p>
      </section>
    </div>
  )
}
