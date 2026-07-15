'use client'

import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useCursor } from '@/lib/cursor-context'

/**
 * V2 Holographic human body — a living, breathing medical hologram.
 *
 * Enhancements over V1:
 *  - Breathing animation on torso (animate-breathe)
 *  - Individual organ hover detection with glow + label
 *  - Animated nervous system energy paths
 *  - Enhanced organ nodes with pulse rings on hover
 *  - Multiple scan ring layers
 *  - Vertical scanning laser with glow trail
 *  - highlightOrgan prop: when set, only that organ illuminates (for Chamber)
 *  - riseAnimation prop: body rises from below (for Chamber)
 *  - compact prop: smaller size variant (for Chamber/Pipeline)
 *
 * All V1 orbiting particles, rings, and scan sweep preserved.
 */

interface OrganDef {
  key: string
  label: string
  cx: number
  cy: number
  r: number
  color: string
  glowColor: string
}

const organs: OrganDef[] = [
  { key: 'brain', label: 'Brain', cx: 110, cy: 44, r: 8, color: '#a78bfa', glowColor: 'rgba(167,139,250,0.9)' },
  { key: 'lungs', label: 'Lungs', cx: 94, cy: 146, r: 9, color: '#22d3ee', glowColor: 'rgba(34,211,238,0.9)' },
  { key: 'heart', label: 'Heart', cx: 122, cy: 148, r: 7, color: '#fb5779', glowColor: 'rgba(251,87,121,0.9)' },
  { key: 'kidneys', label: 'Kidneys', cx: 110, cy: 210, r: 6, color: '#34d399', glowColor: 'rgba(52,211,153,0.9)' },
  { key: 'abdomen', label: 'Abdomen', cx: 110, cy: 240, r: 7, color: '#f59e0b', glowColor: 'rgba(245,158,11,0.9)' },
  { key: 'bones', label: 'Skeletal', cx: 110, cy: 310, r: 6, color: '#3b82f6', glowColor: 'rgba(59,130,246,0.9)' },
  { key: 'breast', label: 'Chest', cx: 110, cy: 130, r: 7, color: '#fbbf24', glowColor: 'rgba(251,191,36,0.9)' },
]

interface HolographicBodyProps {
  highlightOrgan?: string      // key of the organ to force-illuminate
  riseAnimation?: boolean      // cinematic rise from below
  compact?: boolean            // smaller size
  onOrganClick?: (key: string) => void
}

export function HolographicBody({
  highlightOrgan,
  riseAnimation = false,
  compact = false,
  onOrganClick,
}: HolographicBodyProps) {
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null)
  const { mouseX, mouseY, isTouch } = useCursor()
  const svgRef = useRef<SVGSVGElement>(null)
  
  // Track proximity-based organ illumination
  const [proximityOrgans, setProximityOrgans] = useState<Record<string, number>>({})

  useEffect(() => {
    if (isTouch || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    
    // Convert global mouse position to local SVG coordinates
    // SVG viewBox is 0 0 220 440
    const scaleX = 220 / rect.width
    const scaleY = 440 / rect.height
    
    const localX = (mouseX - rect.left) * scaleX
    const localY = (mouseY - rect.top) * scaleY

    const newProximity: Record<string, number> = {}
    
    organs.forEach(organ => {
      const dist = Math.sqrt(Math.pow(localX - organ.cx, 2) + Math.pow(localY - organ.cy, 2))
      const maxDist = 50 // Threshold for illumination
      if (dist < maxDist) {
        newProximity[organ.key] = 1 - dist / maxDist
      }
    })
    
    setProximityOrgans(newProximity)
  }, [mouseX, mouseY, isTouch])

  const activeOrgan = highlightOrgan || hoveredOrgan

  const orbiters = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        size: 5 + i * 1.5,
        radius: 120 + i * 26,
        duration: 9 + i * 3,
        delay: i * 0.6,
        reverse: i % 2 === 0,
      })),
    [],
  )

  const handleOrganHover = useCallback((key: string | null) => {
    if (!highlightOrgan) setHoveredOrgan(key)
  }, [highlightOrgan])

  const scale = compact ? 0.65 : 1

  return (
    <motion.div
      className="relative flex items-center justify-center"
      data-r3f-placeholder="holographic-body"
      style={{ transform: `scale(${scale})` }}
      {...(riseAnimation ? {
        initial: { opacity: 0, y: 80, filter: 'blur(8px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] },
      } : {})}
    >
      {/* Ground glow */}
      <div className="absolute bottom-4 h-16 w-64 rounded-[100%] bg-cyan/25 blur-2xl" />

      {/* Rotating rings — V1 preserved + V2 extras */}
      <div className="animate-spin-slow absolute h-[420px] w-[420px] rounded-full border border-cyan/20" />
      <div className="animate-spin-slower absolute h-[340px] w-[340px] rounded-full border border-blue/20" />
      <div className="absolute h-[480px] w-[480px] rounded-full border border-dashed border-purple/10" />
      {/* V2 — extra tilted ring */}
      <div
        className="animate-spin-slow absolute h-[380px] w-[380px] rounded-full border border-cyan/10"
        style={{ transform: 'rotateX(60deg) rotateZ(30deg)' }}
      />
      {/* V2 — scanning ring with perspective */}
      <div
        className="animate-scanner-ring absolute h-[460px] w-[460px] rounded-full border-2 border-dashed border-cyan/15"
        style={{ transformStyle: 'preserve-3d' }}
      />

      {/* Orbiting particles — V1 preserved */}
      {orbiters.map((o) => (
        <motion.div
          key={o.id}
          className="absolute"
          style={{ width: o.radius * 2, height: o.radius * 2 }}
          animate={{ rotate: o.reverse ? -360 : 360 }}
          transition={{ duration: o.duration, repeat: Infinity, ease: 'linear' }}
        >
          <span
            className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-cyan"
            style={{
              width: o.size,
              height: o.size,
              boxShadow: '0 0 14px 2px rgba(34,211,238,0.9)',
            }}
          />
        </motion.div>
      ))}

      {/* Body projection — V2 with breathing */}
      <motion.div
        className="animate-float-y relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <svg
          ref={svgRef}
          width="220"
          height="440"
          viewBox="0 0 220 440"
          className="relative z-20 h-full w-full opacity-90 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] mix-blend-screen animate-breathe"
        >
          <defs>
            <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.30)" />
              <stop offset="55%" stopColor="rgba(59,130,246,0.16)" />
              <stop offset="100%" stopColor="rgba(167,139,250,0.10)" />
            </linearGradient>
            <linearGradient id="bodyStroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7ff0ff" />
              <stop offset="100%" stopColor="#7aa8ff" />
            </linearGradient>
            {/* V2 — organ glow filters */}
            <filter id="organGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Simplified human silhouette — V1 preserved */}
          <path
            d="M110 14c16 0 28 12 28 30 0 12-5 20-11 26 14 5 24 15 27 32l10 74c2 12-14 17-18 5l-8-42-3 60c6 40 12 74 15 118 1 12-18 14-21 2l-19-92-19 92c-3 12-22 10-21-2 3-44 9-78 15-118l-3-60-8 42c-4 12-20 7-18-5l10-74c3-17 13-27 27-32-6-6-11-14-11-26 0-18 12-30 28-30z"
            fill="url(#bodyFill)"
            stroke="url(#bodyStroke)"
            strokeWidth={1.4}
          />

          {/* V2 — Nervous system energy paths */}
          <motion.path
            d="M110 44 L110 70 L110 100 L110 150 L110 210 L110 280 L110 340 L110 400"
            fill="none"
            stroke="rgba(34,211,238,0.5)"
            strokeWidth={1}
            strokeDasharray="8 6"
            animate={{ strokeDashoffset: [200, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(34,211,238,0.6))' }}
          />
          {/* Spine → Arms branches */}
          <motion.path
            d="M110 100 L78 130 L60 180 M110 100 L142 130 L160 180"
            fill="none"
            stroke="rgba(34,211,238,0.3)"
            strokeWidth={0.8}
            strokeDasharray="6 8"
            animate={{ strokeDashoffset: [150, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 1 }}
          />

          {/* Organ nodes — V2 with hover interaction */}
          {organs.map((organ) => {
            const isActive = activeOrgan === organ.key
            const prox = proximityOrgans[organ.key] || 0
            const isIlluminated = isActive || prox > 0.1
            const pulseScale = isIlluminated ? 1 + prox * 0.5 : 1

            return (
              <g
                key={organ.key}
                onMouseEnter={() => handleOrganHover(organ.key)}
                onMouseLeave={() => handleOrganHover(null)}
                onClick={() => onOrganClick?.(organ.key)}
                className="cursor-pointer"
                style={{
                  opacity: isIlluminated ? 1 : 0.4,
                  transition: 'opacity 0.3s ease-out',
                }}
              >
                <circle cx={organ.cx} cy={organ.cy} r={organ.r + 8} fill="transparent" />
                
                {isIlluminated && (
                  <motion.circle
                    cx={organ.cx}
                    cy={organ.cy}
                    r={organ.r + 6}
                    fill="none"
                    stroke={organ.color}
                    strokeWidth="1"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                
                <motion.circle
                  cx={organ.cx}
                  cy={organ.cy}
                  r={organ.r}
                  fill={organ.color}
                  animate={{ scale: pulseScale }}
                  style={{
                    filter: `drop-shadow(0 0 ${isIlluminated ? 12 + prox * 8 : 4}px ${organ.glowColor})`,
                  }}
                />
                
                {isIlluminated && (
                  <text
                    x={organ.cx + 20}
                    y={organ.cy + 4}
                    fill={organ.color}
                    className="pointer-events-none font-mono text-[9px] font-bold uppercase tracking-widest drop-shadow-md"
                    style={{ opacity: 0.8 + prox * 0.2 }}
                  >
                    {organ.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* V2 — Organ label on hover */}
        <AnimatePresence>
          {activeOrgan && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
              className="absolute left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full glass text-xs font-mono text-cyan"
              style={{
                top: (() => {
                  const organ = organs.find(o => o.key === activeOrgan)
                  if (!organ) return '10%'
                  return `${(organ.cy / 440) * 100 - 8}%`
                })(),
              }}
            >
              {organs.find(o => o.key === activeOrgan)?.label}
              <span className="ml-2 text-muted-foreground">Scan Ready</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vertical scan sweep — V1 preserved */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-scan-line absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan/40 to-transparent" />
        </div>

        {/* V2 — Secondary horizontal scan */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-scan-horizontal absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-blue/20 to-transparent" />
        </div>

        {/* V2 — Scanning laser beam */}
        <motion.div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 w-[2px] z-20"
          style={{
            height: '100%',
            background: 'linear-gradient(to bottom, transparent, rgba(34,211,238,0.8), transparent)',
            boxShadow: '0 0 12px 2px rgba(34,211,238,0.6)',
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scaleY: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </motion.div>
  )
}
