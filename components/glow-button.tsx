'use client'

import { motion, type HTMLMotionProps } from 'motion/react'
import { cn } from '@/lib/utils'
import { useTilt } from '@/lib/use-tilt'
import { useCursor } from '@/lib/cursor-context'

type Variant = 'cyan' | 'ghost' | 'outline'

interface GlowButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  cyan: 'text-cyan-foreground bg-cyan border-transparent shadow-[0_0_30px_-4px_rgba(34,211,238,0.7)]',
  outline:
    'text-cyan border-cyan/40 bg-cyan/5 hover:bg-cyan/10 shadow-[0_0_20px_-8px_rgba(34,211,238,0.6)]',
  ghost: 'text-surface-foreground border-white/10 bg-white/5 hover:bg-white/10',
}

export function GlowButton({
  variant = 'cyan',
  className,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: GlowButtonProps) {
  const { ref, cursorX, cursorY } = useTilt({ maxRotation: 5, scale: 1.05 })
  const { setVariant } = useCursor()

  const handleEnter = (e: any) => {
    setVariant('hover')
    if (onMouseEnter) onMouseEnter(e)
  }

  const handleLeave = (e: any) => {
    setVariant('default')
    if (onMouseLeave) onMouseLeave(e)
  }

  return (
    <motion.button
      ref={ref as any}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.035, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border px-7 py-3 text-sm font-medium tracking-wide transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cyan/70',
        styles[variant],
        className,
      )}
      {...props}
    >
      {/* dynamic reflection */}
      <span
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle 60px at ${cursorX}px ${cursorY}px, rgba(255,255,255,0.4), transparent 100%)`,
        }}
      />
      {/* old sheen */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}
