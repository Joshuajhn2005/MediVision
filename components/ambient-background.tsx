'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion } from 'motion/react'

/**
 * V2 Full-screen living medical operating system backdrop.
 *
 * Layers (back-to-front):
 *  1. Deep radial ambient glow (V1)
 *  2. Animated medical grid (V1)
 *  3. Neural network connections (V1)
 *  4. DNA helix (V2)
 *  5. Holographic scan wave (V2)
 *  6. Floating particles — medical motes (V1, extended)
 *  7. Molecular particles — larger, varied (V2)
 *  8. Rotating medical grid plane (V2)
 *  9. ECG pulse (V1)
 * 10. Volumetric fog (V2)
 * 11. Vignette (V1)
 *
 * Cursor-reactive parallax shifts layers 1-3 based on mouse position.
 */
export function AmbientBackground() {
  const [mounted, setMounted] = useState(false)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => setMounted(true), [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMouse({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  // V1 particles (preserved, count increased from 26 → 34)
  const particles = useMemo(
    () =>
      Array.from({ length: 34 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        duration: 10 + Math.random() * 16,
        delay: Math.random() * 8,
        drift: (Math.random() - 0.5) * 40,
      })),
    [],
  )

  // V1 neural nodes (preserved)
  const nodes = useMemo(
    () =>
      Array.from({ length: 9 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
      })),
    [],
  )

  // V2 molecular particles — larger, hexagonal/cross-shaped
  const molecularParticles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 4 + Math.random() * 6,
        duration: 16 + Math.random() * 12,
        delay: Math.random() * 10,
        drift: (Math.random() - 0.5) * 60,
        type: i % 3 === 0 ? 'hex' : i % 3 === 1 ? 'cross' : 'ring',
      })),
    [],
  )

  // V2 DNA helix base pairs
  const dnaBasePairs = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        y: (i / 14) * 100,
        delay: i * 0.3,
      })),
    [],
  )

  // Parallax offsets based on cursor
  const px = (mouse.x - 0.5) * 20
  const py = (mouse.y - 0.5) * 14

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* Deep radial ambient glow — V1 preserved, cursor-reactive */}
      <div
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${px * 0.3}px, ${py * 0.3}px)`,
          background:
            'radial-gradient(70% 55% at 50% 12%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(60% 50% at 85% 90%, rgba(59,130,246,0.10), transparent 60%), radial-gradient(50% 50% at 10% 80%, rgba(167,139,250,0.08), transparent 60%)',
        }}
      />

      {/* Animated medical grid — V1 preserved, cursor-reactive */}
      <div className="absolute inset-0 grid-mask opacity-[0.5]">
        <div
          className="animate-grid-pan absolute inset-[-60px] transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(${px * 0.15}px, ${py * 0.15}px)`,
            backgroundImage:
              'linear-gradient(rgba(46,120,150,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(46,120,150,0.16) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Neural network connections — V1 preserved, cursor-reactive */}
      <svg
        className="absolute inset-0 h-full w-full opacity-40 transition-transform duration-1000 ease-out"
        style={{ transform: `translate(${px * 0.2}px, ${py * 0.2}px)` }}
      >
        {mounted &&
          nodes.map((n, i) =>
          nodes.slice(i + 1).map((m, j) => {
            const dist = Math.hypot(n.x - m.x, n.y - m.y)
            if (dist > 38) return null
            return (
              <motion.line
                key={`${i}-${j}`}
                x1={`${n.x}%`}
                y1={`${n.y}%`}
                x2={`${m.x}%`}
                y2={`${m.y}%`}
                stroke="url(#neural)"
                strokeWidth={0.6}
                initial={{ opacity: 0.05 }}
                animate={{ opacity: [0.05, 0.3, 0.05] }}
                transition={{
                  duration: 5 + ((i + j) % 5),
                  repeat: Infinity,
                  delay: (i + j) * 0.4,
                }}
              />
            )
          }),
        )}
        {mounted &&
          nodes.map((n, i) => (
            <circle
              key={i}
              cx={`${n.x}%`}
              cy={`${n.y}%`}
              r={1.6}
              fill="rgba(34,211,238,0.7)"
            />
          ))}
        <defs>
          <linearGradient id="neural" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      {/* V2 — DNA Helix */}
      {mounted && (
        <div
          className="absolute right-[8%] top-[15%] h-[55%] w-20 opacity-20"
          style={{ perspective: '400px' }}
        >
          <div className="animate-dna-helix relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
            {dnaBasePairs.map((bp) => (
              <motion.div
                key={bp.id}
                className="absolute left-0 right-0 h-[2px] rounded-full"
                style={{ top: `${bp.y}%` }}
                animate={{
                  rotateY: [0, 360],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 6,
                  delay: bp.delay,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <span className="absolute left-0 h-1.5 w-1.5 rounded-full bg-cyan" style={{ boxShadow: '0 0 6px #22d3ee' }} />
                <span className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-cyan/60 via-blue/30 to-purple/60" />
                <span className="absolute right-0 h-1.5 w-1.5 rounded-full bg-purple" style={{ boxShadow: '0 0 6px #a78bfa' }} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* V2 — Holographic scan wave */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="animate-hologram-wave absolute inset-y-0 w-64 bg-gradient-to-r from-transparent via-cyan/8 to-transparent"
          style={{ filter: 'blur(30px)' }}
        />
      </div>

      {/* V1 — Floating particles (DNA / medical motes) — count increased */}
      {mounted &&
        particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: 'rgba(34,211,238,0.75)',
            boxShadow: '0 0 8px rgba(34,211,238,0.9)',
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, p.drift, 0],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* V2 — Molecular particles (larger, varied shapes) */}
      {mounted &&
        molecularParticles.map((mp) => (
          <motion.div
            key={`mol-${mp.id}`}
            className="absolute"
            style={{
              left: `${mp.x}%`,
              top: `${mp.y}%`,
            }}
            animate={{
              y: [0, -80, 0],
              x: [0, mp.drift, 0],
              opacity: [0, 0.6, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: mp.duration,
              repeat: Infinity,
              delay: mp.delay,
              ease: 'easeInOut',
            }}
          >
            {mp.type === 'hex' && (
              <svg width={mp.size} height={mp.size} viewBox="0 0 12 12">
                <polygon
                  points="6,1 11,3.5 11,8.5 6,11 1,8.5 1,3.5"
                  fill="none"
                  stroke="rgba(34,211,238,0.5)"
                  strokeWidth={0.8}
                />
              </svg>
            )}
            {mp.type === 'cross' && (
              <svg width={mp.size} height={mp.size} viewBox="0 0 12 12">
                <line x1="6" y1="1" x2="6" y2="11" stroke="rgba(59,130,246,0.5)" strokeWidth={0.8} />
                <line x1="1" y1="6" x2="11" y2="6" stroke="rgba(59,130,246,0.5)" strokeWidth={0.8} />
              </svg>
            )}
            {mp.type === 'ring' && (
              <svg width={mp.size} height={mp.size} viewBox="0 0 12 12">
                <circle cx="6" cy="6" r="4.5" fill="none" stroke="rgba(167,139,250,0.45)" strokeWidth={0.7} />
                <circle cx="6" cy="6" r="1" fill="rgba(167,139,250,0.6)" />
              </svg>
            )}
          </motion.div>
        ))}

      {/* V2 — Rotating medical grid plane with perspective */}
      {mounted && (
        <div className="absolute bottom-0 left-0 right-0 h-[45%] overflow-hidden opacity-[0.12]" style={{ perspective: '600px' }}>
          <div
            className="animate-grid-pan absolute inset-0"
            style={{
              transform: 'rotateX(65deg) translateZ(-40px)',
              transformOrigin: 'center bottom',
              backgroundImage:
                'linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>
      )}

      {/* V1 — ECG pulse along the bottom (preserved) */}
      <div className="absolute bottom-0 left-0 right-0 h-24 opacity-30">
        <svg
          className="h-full w-full"
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0 50 H320 l14 -34 l16 68 l14 -34 H620 l10 -20 l10 40 l10 -20 H1200"
            fill="none"
            stroke="#22d3ee"
            strokeWidth={2}
            strokeDasharray="1400"
            initial={{ strokeDashoffset: 1400 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'linear' }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.8))' }}
          />
        </svg>
      </div>

      {/* V2 — Volumetric fog layer */}
      <div className="animate-volumetric-fog absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 40% at 30% 70%, rgba(34,211,238,0.04), transparent 70%), radial-gradient(ellipse 80% 50% at 70% 30%, rgba(59,130,246,0.03), transparent 60%)',
          }}
        />
      </div>

      {/* V1 — Vignette for depth (preserved) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(2,6,12,0.85) 100%)',
        }}
      />
    </div>
  )
}
