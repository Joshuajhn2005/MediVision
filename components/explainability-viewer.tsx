'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  ChevronDown,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Move,
  Download,
} from 'lucide-react'
import type { ExplainabilityOverlay, ExplainabilityViewerProps } from '@/lib/types/explainability'
import { getMethodDisplayName, getMethodDescription } from '@/lib/types/explainability'

/**
 * Explainability Viewer
 *
 * Generic explainability visualization viewer supporting:
 * - Multiple overlay methods (GradCAM, GradCAM++, ScoreCAM, etc)
 * - Opacity control
 * - Before/After toggle
 * - Zoom and pan
 * - Fullscreen mode
 *
 * Extensible: add new methods by extending overlay array on backend.
 * Components never need refactoring.
 */

interface ViewerState {
  activeOverlay: ExplainabilityOverlay | null
  opacity: number
  showOverlay: boolean
  zoom: number
  pan: { x: number; y: number }
  isFullscreen: boolean
  showBeforeAfter: boolean
  isDragging: boolean
}

export function ExplainabilityViewer({
  originalImage,
  overlays,
  activeOverlay: initialActiveOverlay,
  onOverlayChange,
  title,
  description,
}: ExplainabilityViewerProps) {
  const [state, setState] = useState<ViewerState>({
    activeOverlay: overlays.length > 0 ? overlays[0] : null,
    opacity: 75,
    showOverlay: true,
    zoom: 1,
    pan: { x: 0, y: 0 },
    isFullscreen: false,
    showBeforeAfter: false,
    isDragging: false,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  // Update active overlay
  const handleOverlayChange = (overlay: ExplainabilityOverlay) => {
    setState((prev) => ({
      ...prev,
      activeOverlay: overlay,
      showOverlay: true,
      showBeforeAfter: false,
    }))
    onOverlayChange?.(overlay.method)
  }

  // Opacity slider
  const handleOpacityChange = (opacity: number) => {
    setState((prev) => ({ ...prev, opacity }))
  }

  // Toggle overlay visibility
  const toggleOverlay = () => {
    setState((prev) => ({ ...prev, showOverlay: !prev.showOverlay }))
  }

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    setState((prev) => ({
      ...prev,
      zoom: direction === 'in' ? Math.min(prev.zoom + 0.2, 3) : Math.max(prev.zoom - 0.2, 1),
    }))
  }

  // Pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    setState((prev) => ({ ...prev, isDragging: true }))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStartRef.current || !state.isDragging) return

    const deltaX = e.clientX - dragStartRef.current.x
    const deltaY = e.clientY - dragStartRef.current.y

    setState((prev) => ({
      ...prev,
      pan: {
        x: prev.pan.x + deltaX,
        y: prev.pan.y + deltaY,
      },
    }))

    dragStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    dragStartRef.current = null
    setState((prev) => ({ ...prev, isDragging: false }))
  }

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!state.isFullscreen) {
      containerRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }

    setState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }))
  }

  // Export current view
  const handleExport = async () => {
    if (!containerRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Simple export - can be enhanced with html2canvas
    const link = document.createElement('a')
    link.href = state.activeOverlay?.image_url || originalImage
    link.download = `explainability-${state.activeOverlay?.method || 'original'}.png`
    link.click()
  }

  const activeOverlay = state.activeOverlay

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col gap-4 rounded-2xl bg-white/5 p-6 border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{title || 'Explainability Analysis'}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>

      {/* Main Viewer */}
      <div className="relative overflow-hidden rounded-xl bg-black/40 aspect-video flex items-center justify-center">
        <div
          className="relative w-full h-full flex items-center justify-center cursor-move select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            overflow: 'hidden',
          }}
        >
          {/* Original Image */}
          <motion.img
            src={originalImage}
            alt="Original scan"
            className="absolute inset-0 w-full h-full object-contain"
            animate={{
              scale: state.zoom,
              x: state.pan.x,
              y: state.pan.y,
            }}
            transition={{ type: 'tween' }}
          />

          {/* Overlay Image */}
          {activeOverlay && state.showOverlay && (
            <motion.img
              src={activeOverlay.image_url}
              alt="Explainability overlay"
              className="absolute inset-0 w-full h-full object-contain"
              animate={{
                scale: state.zoom,
                x: state.pan.x,
                y: state.pan.y,
                opacity: state.opacity / 100,
              }}
              transition={{ type: 'tween' }}
            />
          )}

          {/* Before/After Divider */}
          {state.showBeforeAfter && (
            <motion.div
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-cyan via-blue to-purple"
              animate={{ x: state.pan.x }}
              style={{
                left: '50%',
              }}
            />
          )}

          {/* Controls Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity gap-4">
            <button
              onClick={() => handleZoom('out')}
              className="rounded-lg bg-black/50 p-2 text-white hover:bg-black/70 transition"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm text-white font-mono">{Math.round(state.zoom * 100)}%</span>
            <button
              onClick={() => handleZoom('in')}
              className="rounded-lg bg-black/50 p-2 text-white hover:bg-black/70 transition"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        {/* Method Selector */}
        {overlays.length > 1 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Explainability Method
            </label>
            <div className="relative">
              <select
                value={activeOverlay?.method || ''}
                onChange={(e) => {
                  const selected = overlays.find((o) => o.method === e.target.value)
                  if (selected) handleOverlayChange(selected)
                }}
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm border border-white/10 text-white cursor-pointer appearance-none pr-8 hover:bg-white/15 transition"
              >
                {overlays.map((overlay) => (
                  <option key={overlay.method} value={overlay.method}>
                    {getMethodDisplayName(overlay.method)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
            </div>
            {activeOverlay && (
              <p className="text-xs text-muted-foreground">
                {getMethodDescription(activeOverlay.method)}
              </p>
            )}
          </div>
        )}

        {/* Opacity Slider */}
        {activeOverlay && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Overlay Opacity
              </label>
              <span className="text-sm font-mono text-cyan">{state.opacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={state.opacity}
              onChange={(e) => handleOpacityChange(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-white/10 appearance-none cursor-pointer accent-cyan"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={toggleOverlay}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-white/10 hover:bg-white/15 transition text-white"
            title={state.showOverlay ? 'Hide overlay' : 'Show overlay'}
          >
            {state.showOverlay ? (
              <>
                <Eye className="h-4 w-4" />
                Hide Overlay
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                Show Overlay
              </>
            )}
          </button>

          <button
            onClick={() => setState((prev) => ({ ...prev, showBeforeAfter: !prev.showBeforeAfter }))}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-white/10 hover:bg-white/15 transition text-white"
            title="Toggle before/after view"
          >
            <Move className="h-4 w-4" />
            Before/After
          </button>

          <button
            onClick={() => setState((prev) => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }))}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-white/10 hover:bg-white/15 transition text-white"
            title="Reset view"
          >
            Reset View
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-white/10 hover:bg-white/15 transition text-white ml-auto"
            title={state.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {state.isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4" />
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
              </>
            )}
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-cyan/10 hover:bg-cyan/20 transition text-cyan"
            title="Download overlay image"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* Metadata */}
        {activeOverlay && (
          <div className="rounded-lg bg-white/5 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method:</span>
              <span className="text-white font-mono">{getMethodDisplayName(activeOverlay.method)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Confidence:</span>
              <span className="text-cyan font-mono">{Math.round(activeOverlay.confidence * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Generation Time:</span>
              <span className="text-white font-mono">{activeOverlay.metadata.generation_time_ms}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model Version:</span>
              <span className="text-white font-mono">{activeOverlay.metadata.model_version}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
