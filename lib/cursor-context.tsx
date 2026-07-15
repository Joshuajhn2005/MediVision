'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'

export type CursorVariant = 'default' | 'hover' | 'drag' | 'analyzing' | 'click'

interface CursorContextType {
  variant: CursorVariant
  label: string | null
  setVariant: (variant: CursorVariant) => void
  setLabel: (label: string | null) => void
  isTouch: boolean
  mouseX: number
  mouseY: number
}

const CursorContext = createContext<CursorContextType | undefined>(undefined)

export function CursorProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<CursorVariant>('default')
  const [label, setLabel] = useState<string | null>(null)
  const [isTouch, setIsTouch] = useState(false)
  
  // Track mouse coordinates outside React state to avoid massive re-renders
  const mousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Check if it's a touch device
    if (typeof window !== 'undefined') {
      const matchMedia = window.matchMedia('(hover: none) and (pointer: coarse)')
      setIsTouch(matchMedia.matches)
      
      const handleChange = (e: MediaQueryListEvent) => setIsTouch(e.matches)
      matchMedia.addEventListener('change', handleChange)

      const handleMouseMove = (e: MouseEvent) => {
        mousePos.current.x = e.clientX
        mousePos.current.y = e.clientY
      }
      
      const handleMouseDown = () => {
        setVariant('click')
      }
      const handleMouseUp = () => {
        setVariant('default')
      }

      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      window.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mouseup', handleMouseUp)

      return () => {
        matchMedia.removeEventListener('change', handleChange)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [])

  return (
    <CursorContext.Provider
      value={{
        variant,
        label,
        setVariant,
        setLabel,
        isTouch,
        get mouseX() { return mousePos.current.x },
        get mouseY() { return mousePos.current.y },
      }}
    >
      {children}
    </CursorContext.Provider>
  )
}

export function useCursor() {
  const context = useContext(CursorContext)
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider')
  }
  return context
}
