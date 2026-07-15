'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useSpring, useMotionValue, AnimatePresence } from 'motion/react'
import { useCursor } from '@/lib/cursor-context'

export function CustomCursor() {
  const { variant, label, isTouch, mouseX, mouseY } = useCursor()
  
  // Motion values for smooth spring physics
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  // Spring config for the cursor elements
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 }
  const springX = useSpring(cursorX, springConfig)
  const springY = useSpring(cursorY, springConfig)
  
  // Slower spring for trailing effects
  const smoothSpringConfig = { damping: 40, stiffness: 200, mass: 1 }
  const smoothX = useSpring(cursorX, smoothSpringConfig)
  const smoothY = useSpring(cursorY, smoothSpringConfig)

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }
    window.addEventListener('mousemove', updatePosition, { passive: true })
    return () => window.removeEventListener('mousemove', updatePosition)
  }, [cursorX, cursorY])

  if (isTouch) return null

  const isHover = variant === 'hover' || variant === 'analyzing'
  const isDrag = variant === 'drag'
  const isAnalyzing = variant === 'analyzing'
  const isClick = variant === 'click'

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Container tracking cursor position */}
      <motion.div
        className="absolute top-0 left-0 flex items-center justify-center"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        {/* Main Reticle */}
        <motion.div
          animate={{
            scale: isClick ? 0.8 : isHover ? 1.4 : isDrag ? 1.2 : 1,
            rotate: isAnalyzing ? 360 : 0,
          }}
          transition={{
            scale: { type: 'spring', stiffness: 300, damping: 20 },
            rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
          }}
          className="relative flex items-center justify-center"
        >
          {/* Inner targeting dot */}
          <motion.div
            className="absolute rounded-full bg-cyan"
            animate={{
              width: isClick ? 8 : isHover ? 4 : 4,
              height: isClick ? 8 : isHover ? 4 : 4,
              opacity: isHover ? 1 : 0.6,
            }}
            style={{ boxShadow: '0 0 8px rgba(34,211,238,0.8)' }}
          />

          {/* Outer ring */}
          <motion.svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            className="opacity-70"
            animate={{
              rotate: 360,
              opacity: isHover ? 1 : 0.7,
            }}
            transition={{
              rotate: { duration: isHover ? 3 : 8, repeat: Infinity, ease: 'linear' }
            }}
          >
            <circle
              cx="16" cy="16" r="14"
              fill="none"
              stroke="rgba(34,211,238,0.4)"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
            {/* Analyzing specific details */}
            {isAnalyzing && (
              <circle
                cx="16" cy="16" r="10"
                fill="none"
                stroke="rgba(59,130,246,0.5)"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
            )}
          </motion.svg>
        </motion.div>

        {/* Click ripple flash */}
        <AnimatePresence>
          {isClick && (
            <motion.div
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute rounded-full border border-cyan"
              style={{ width: 40, height: 40, boxShadow: '0 0 12px rgba(34,211,238,0.5)' }}
            />
          )}
        </AnimatePresence>

        {/* Ambient breathing glow */}
        <motion.div
          className="absolute rounded-full mix-blend-screen"
          style={{
            width: 80,
            height: 80,
            background: 'radial-gradient(circle, rgba(34,211,238,0.15), transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Label beneath cursor */}
        <AnimatePresence>
          {label && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 24 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute whitespace-nowrap font-mono text-[9px] uppercase tracking-widest text-cyan"
              style={{ textShadow: '0 0 6px rgba(34,211,238,0.6)' }}
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
