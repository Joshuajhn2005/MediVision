'use client'

import { useRef, useCallback, useState, useEffect } from 'react'

interface UseTiltOptions {
  maxRotation?: number
  scale?: number
  perspective?: number
}

export function useTilt({
  maxRotation = 4,
  scale = 1,
  perspective = 600,
}: UseTiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)
  
  // Track cursor position inside element (for reflection gradient)
  const [cursorX, setCursorX] = useState(-100)
  const [cursorY, setCursorY] = useState(-100)
  const [isHovered, setIsHovered] = useState(false)

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!ref.current) return
      
      const el = ref.current
      const rect = el.getBoundingClientRect()
      
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setCursorX(x)
      setCursorY(y)
      
      // Calculate rotation
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      
      const rotateX = ((y - centerY) / centerY) * -maxRotation
      const rotateY = ((x - centerX) / centerX) * maxRotation
      
      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
    },
    [maxRotation, perspective, scale]
  )

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true)
    if (ref.current) {
      ref.current.style.transition = 'transform 0.1s ease-out'
    }
  }, [])

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false)
    if (ref.current) {
      ref.current.style.transition = 'transform 0.5s ease-out'
      ref.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    }
  }, [perspective])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerenter', handlePointerEnter)
    el.addEventListener('pointerleave', handlePointerLeave)
    el.addEventListener('pointercancel', handlePointerLeave)
    
    return () => {
      el.removeEventListener('pointermove', handlePointerMove)
      el.removeEventListener('pointerenter', handlePointerEnter)
      el.removeEventListener('pointerleave', handlePointerLeave)
      el.removeEventListener('pointercancel', handlePointerLeave)
    }
  }, [handlePointerMove, handlePointerEnter, handlePointerLeave])

  return { ref, cursorX, cursorY, isHovered }
}
