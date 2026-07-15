'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useCursor } from '@/lib/cursor-context'

/**
 * V2 — AI Core: A floating intelligence sphere.
 *
 * Visual representation of the deep learning inference engine.
 * Reusable across Landing Hero, Radiology Chamber, and Analysis Pipeline.
 *
 * States:
 *  - idle:      gentle breathing glow, slow orbiting particles
 *  - scanning:  brightness surges, particles accelerate, rings spin faster
 *  - connected: neural energy beams from sphere outward
 *
 * Props:
 *  - state: 'idle' | 'scanning' | 'connected'
 *  - size: pixel diameter of the core sphere (default 120)
 *  - className: additional positioning classes
 */

export type AiCoreState = 'idle' | 'scanning' | 'connected'

interface AiCoreProps {
  state?: AiCoreState
  size?: number
  className?: string
}

export function AiCore({ state = 'idle', size = 120, className = '' }: AiCoreProps) {
  const { mouseX, mouseY, isTouch } = useCursor()
  const ref = useRef<HTMLDivElement>(null)
  const [proximity, setProximity] = useState(0) // 0 to 1 based on distance

  useEffect(() => {
    if (isTouch || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dist = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2))
    
    const maxDist = 300
    if (dist < maxDist) {
      setProximity(1 - dist / maxDist)
    } else {
      setProximity(0)
    }
  }, [mouseX, mouseY, isTouch])

  const isScanning = state === 'scanning' || state === 'connected' || proximity > 0.5
  const isConnected = state === 'connected'

  const ringLayers = useMemo(
    () => [
      { radius: size * 0.8, width: 1, dash: '6 8', dur: isScanning ? 4 : 8, reverse: false },
      { radius: size * 1.0, width: 0.8, dash: '4 12', dur: isScanning ? 6 : 12, reverse: true },
      { radius: size * 1.2, width: 0.6, dash: '3 16', dur: isScanning ? 8 : 16, reverse: false },
      { radius: size * 1.4, width: 0.4, dash: '8 14', dur: isScanning ? 5 : 10, reverse: true },
    ],
    [size, isScanning],
  )

  const orbitingParticles = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        orbitRadius: size * 0.5 + i * (size * 0.12),
        particleSize: 2 + i * 0.5,
        dur: isScanning ? 3 + i * 0.6 : 6 + i * 1.2,
        reverse: i % 2 === 0,
        delay: i * 0.3,
      })),
    [size, isScanning],
  )

  const neuralBeams = useMemo(
    () => [
      { angle: -30, length: size * 2.2 },
      { angle: 0, length: size * 2.5 },
      { angle: 30, length: size * 2.0 },
      { angle: 150, length: size * 1.8 },
      { angle: 180, length: size * 2.4 },
      { angle: 210, length: size * 1.9 },
    ],
    [size],
  )

  return (
    <div
      ref={ref}
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size * 3, height: size * 3 }}
      data-r3f-placeholder="ai-core"
    >
      {/* Ambient glow behind sphere */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.8,
          height: size * 1.8,
          background: isScanning
            ? 'radial-gradient(circle, rgba(34,211,238,0.25), rgba(59,130,246,0.1), transparent 70%)'
            : 'radial-gradient(circle, rgba(34,211,238,0.12), transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{
          scale: isScanning ? [1, 1.15, 1] : [1, 1.06, 1],
          opacity: isScanning ? [0.6, 1, 0.6] : [0.3, 0.5, 0.3],
        }}
        transition={{ duration: isScanning ? 1.5 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Concentric rotating rings */}
      <svg
        className="absolute"
        width={size * 3}
        height={size * 3}
        viewBox={`0 0 ${size * 3} ${size * 3}`}
      >
        {ringLayers.map((ring, i) => (
          <motion.circle
            key={i}
            cx={size * 1.5}
            cy={size * 1.5}
            r={ring.radius}
            fill="none"
            stroke="rgba(34,211,238,0.25)"
            strokeWidth={ring.width}
            strokeDasharray={ring.dash}
            animate={{ rotate: ring.reverse ? -360 : 360 }}
            transition={{ duration: ring.dur, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${size * 1.5}px ${size * 1.5}px` }}
          />
        ))}
      </svg>

      {/* Orbiting particles */}
      {orbitingParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            width: p.orbitRadius * 2,
            height: p.orbitRadius * 2,
            left: `calc(50% - ${p.orbitRadius}px)`,
            top: `calc(50% - ${p.orbitRadius}px)`,
          }}
          animate={{ rotate: p.reverse ? -360 : 360 }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'linear', delay: p.delay }}
        >
          <span
            className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full"
            style={{
              width: p.particleSize,
              height: p.particleSize,
              background: isScanning ? '#22d3ee' : 'rgba(34,211,238,0.7)',
              boxShadow: isScanning
                ? '0 0 10px 2px rgba(34,211,238,1)'
                : '0 0 6px 1px rgba(34,211,238,0.6)',
            }}
          />
        </motion.div>
      ))}

      {/* V2 — Neural energy beams (connected state) */}
      {isConnected && (
        <svg
          className="absolute pointer-events-none"
          width={size * 3}
          height={size * 3}
          viewBox={`0 0 ${size * 3} ${size * 3}`}
        >
          {neuralBeams.map((beam, i) => {
            const cx = size * 1.5
            const cy = size * 1.5
            const rad = (beam.angle * Math.PI) / 180
            const x2 = cx + Math.cos(rad) * beam.length
            const y2 = cy + Math.sin(rad) * beam.length
            return (
              <motion.line
                key={i}
                x1={cx}
                y1={cy}
                x2={x2}
                y2={y2}
                stroke="url(#neuralBeamGrad)"
                strokeWidth={1.2}
                strokeDasharray="8 12"
                initial={{ opacity: 0, strokeDashoffset: 100 }}
                animate={{ opacity: [0.3, 0.7, 0.3], strokeDashoffset: [100, 0] }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'linear',
                }}
              />
            )
          })}
          <defs>
            <linearGradient id="neuralBeamGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Core sphere — the main glowing orb */}
      <motion.div
        className="relative z-10 rounded-full"
        style={{
          width: size,
          height: size,
          background: isScanning
            ? 'radial-gradient(circle at 35% 35%, rgba(120,240,255,0.9), rgba(34,211,238,0.7) 40%, rgba(59,130,246,0.4) 70%, rgba(167,139,250,0.2))'
            : 'radial-gradient(circle at 35% 35%, rgba(120,240,255,0.5), rgba(34,211,238,0.35) 40%, rgba(59,130,246,0.15) 70%, transparent)',
          border: '1px solid rgba(34,211,238,0.3)',
        }}
        animate={{
          scale: isScanning ? [1, 1.08, 1] : [1, 1.04, 1],
          boxShadow: isScanning
            ? [
                '0 0 40px 8px rgba(34,211,238,0.4), inset 0 0 30px rgba(34,211,238,0.3)',
                '0 0 80px 20px rgba(34,211,238,0.7), inset 0 0 50px rgba(34,211,238,0.5)',
                '0 0 40px 8px rgba(34,211,238,0.4), inset 0 0 30px rgba(34,211,238,0.3)',
              ]
            : [
                '0 0 30px 4px rgba(34,211,238,0.2), inset 0 0 20px rgba(34,211,238,0.15)',
                '0 0 50px 10px rgba(34,211,238,0.35), inset 0 0 30px rgba(34,211,238,0.25)',
                '0 0 30px 4px rgba(34,211,238,0.2), inset 0 0 20px rgba(34,211,238,0.15)',
              ],
        }}
        transition={{
          duration: isScanning ? 1.5 : 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Inner glow point */}
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.3,
            height: size * 0.3,
            top: '25%',
            left: '25%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%)',
          }}
        />

        {/* Core ring detail */}
        <motion.div
          className="absolute inset-[15%] rounded-full border border-cyan/30"
          animate={{ rotate: 360 }}
          transition={{ duration: isScanning ? 3 : 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-[25%] rounded-full border border-blue/20"
          animate={{ rotate: -360 }}
          transition={{ duration: isScanning ? 5 : 12, repeat: Infinity, ease: 'linear' }}
        />

        {/* Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan/70 select-none">
            AI
          </span>
        </div>
      </motion.div>
    </div>
  )
}
