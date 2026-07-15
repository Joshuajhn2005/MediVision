'use client'

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, CircleDot } from 'lucide-react'
import { departments, accentHex, type Department } from '@/lib/departments'
import type { View } from '@/components/top-nav'
import { cn } from '@/lib/utils'
import { useTilt } from '@/lib/use-tilt'
import { useCursor } from '@/lib/cursor-context'

/**
 * V2 — Enhanced Department Dashboard.
 *
 * Card hover effects now include:
 *  - Glass-holographic effect with prismatic edge
 *  - Floating particles on hover
 *  - Live heartbeat line animation
 *  - Animated pulse ring from icon
 *  - "Start Analysis" button grows naturally
 *  - Soft reflections moving across card surface
 *  - Rotating organ icon placeholder
 *
 * All V1 features preserved.
 */

const toneColor: Record<Department['statusTone'], string> = {
  normal: 'text-emerald',
  attention: 'text-amber',
  critical: 'text-critical',
}

function DepartmentModule({
  dept,
  index,
  onSelect,
}: {
  dept: Department
  index: number
  onSelect: () => void
}) {
  const hex = accentHex[dept.accent]
  const Icon = dept.icon
  const [hovered, setHovered] = useState(false)
  const { ref, cursorX, cursorY } = useTilt({ maxRotation: 4, scale: 1.02 })
  const { setVariant, setLabel } = useCursor()

  const handleEnter = () => {
    setHovered(true)
    setVariant('analyzing')
    setLabel('SCAN READY')
  }

  const handleLeave = () => {
    setHovered(false)
    setVariant('default')
    setLabel(null)
  }

  // V2 — Hover particles
  const hoverParticles = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        size: 2 + Math.random() * 3,
        dur: 2 + Math.random() * 3,
        delay: Math.random() * 1.5,
      })),
    [],
  )

  return (
    <motion.button
      ref={ref as any}
      onClick={onSelect}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative flex h-72 flex-col overflow-hidden rounded-[1.75rem] p-6 text-left outline-none transition-all duration-500',
        hovered ? 'glass-holographic' : 'glass-strong',
      )}
      style={{ boxShadow: hovered ? `0 0 50px -10px ${hex}55, 0 0 0 1px ${hex}44` : `0 0 0 1px ${hex}22` }}
    >
      {/* V1 — Animated glowing border on hover */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${hex}66, 0 0 40px -6px ${hex}77` }}
      />

      {/* V1 — Holographic scan-line layer revealed on hover */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <span
          className="animate-scan-line absolute inset-x-0 h-24"
          style={{
            background: `linear-gradient(to bottom, transparent, ${hex}30, transparent)`,
          }}
        />
        <span
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${hex}14 1px, transparent 1px), linear-gradient(90deg, ${hex}14 1px, transparent 1px)`,
            backgroundSize: '22px 22px',
          }}
        />
      </span>

      {/* V2 — Moving reflection across card surface using useTilt cursor coords */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100 mix-blend-screen"
        style={{
          background: `radial-gradient(circle 120px at ${cursorX}px ${cursorY}px, ${hex}40, transparent 100%)`,
        }}
      />

      {/* V1 — Ambient corner glow */}
      <span
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: `${hex}30`, opacity: 0.4 }}
      />

      {/* V2 — Hover particles */}
      {hovered &&
        hoverParticles.map((p) => (
          <motion.span
            key={p.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: hex,
              boxShadow: `0 0 6px ${hex}`,
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.8, 0], y: -30 }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity }}
          />
        ))}

      {/* Header row */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="relative">
          {/* V2 — Rotating icon on hover */}
          <motion.span
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: `${hex}1f`, color: hex }}
            animate={hovered ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon className="h-7 w-7" />
          </motion.span>
          {/* pulse rings — V1 preserved */}
          <span
            className="absolute inset-0 rounded-2xl"
            style={{
              boxShadow: `0 0 0 0 ${hex}55`,
              animation: 'pulse-ring 2.6s ease-out infinite',
            }}
          />
          {/* V2 — Extra pulse ring on hover */}
          {hovered && (
            <motion.span
              className="absolute inset-[-4px] rounded-2xl border"
              style={{ borderColor: `${hex}40` }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>

        <span
          className={cn(
            'flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium',
            toneColor[dept.statusTone],
          )}
        >
          <CircleDot className="h-3 w-3" />
          {dept.status}
        </span>
      </div>

      {/* V2 — Live heartbeat animation on hover */}
      {hovered && (
        <div className="absolute right-6 top-20 w-24 h-8 opacity-50">
          <svg viewBox="0 0 100 30" className="w-full h-full">
            <motion.path
              d="M0 15 H25 l5 -10 l6 20 l5 -10 H60 l3 -6 l3 12 l3 -6 H100"
              fill="none"
              stroke={hex}
              strokeWidth={1.5}
              strokeDasharray="200"
              initial={{ strokeDashoffset: 200 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              style={{ filter: `drop-shadow(0 0 3px ${hex})` }}
            />
          </svg>
        </div>
      )}

      {/* Body */}
      <div className="relative z-10 mt-auto">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {dept.modality}
        </div>
        <h3 className="mt-1 font-display text-xl font-semibold">{dept.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {dept.blurb}
        </p>
      </div>

      {/* Footer / integrated action — V2 enhanced with growing button */}
      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-xs text-muted-foreground">
          <span className="font-mono" style={{ color: hex }}>
            {dept.scans}
          </span>{' '}
          scans
        </span>
        <motion.span
          className="flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 transition-all duration-300"
          style={{ color: hex }}
          animate={hovered ? {
            backgroundColor: `${hex}18`,
            paddingLeft: 14,
            paddingRight: 14,
          } : {
            backgroundColor: 'transparent',
          }}
        >
          Start Analysis
          <ArrowRight className="h-3.5 w-3.5" />
        </motion.span>
      </div>
    </motion.button>
  )
}

export function DepartmentDashboard({
  onNavigate,
}: {
  onNavigate: (v: View) => void
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-28 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
          Command Center
        </span>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Department Modules
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
          Six live analysis engines standing by. Hover to bring a module online,
          then launch a study into the neural pipeline.
        </p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept, i) => (
          <DepartmentModule
            key={dept.id}
            dept={dept}
            index={i}
            onSelect={() => onNavigate('upload')}
          />
        ))}
      </div>
    </div>
  )
}
