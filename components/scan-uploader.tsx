'use client'

import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { UploadCloud, ImageIcon, X, ArrowRight, Zap } from 'lucide-react'
import { GlowButton } from '@/components/glow-button'
import { useCursor } from '@/lib/cursor-context'

/**
 * V2 — MRI Scanner Chamber Upload Experience.
 *
 * Transformed from a simple dropzone into an immersive MRI scanner chamber.
 * - Four mechanical corner locks with glow animation
 * - Rotating scanner rings
 * - Laser alignment grid
 * - Depth lighting responsive to drag state
 * - Holographic floor grid
 * - Manual modality selector REMOVED — auto-detection in Chamber
 *
 * When a file is dropped → navigates directly to the Radiology Chamber.
 */

interface ScanUploaderProps {
  onScanReady: (fileName: string) => void
}

export function ScanUploader({ onScanReady }: ScanUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [scannerActive, setScannerActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { setVariant, setLabel } = useCursor()

  const handleFiles = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      setFileName(files[0].name)
      setScannerActive(true)
    }
  }, [])

  const handleLaunch = useCallback(() => {
    if (fileName) {
      onScanReady(fileName)
    }
  }, [fileName, onScanReady])

  return (
    <div className="mx-auto max-w-4xl px-5 pt-28 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
          Acquisition Bay
        </span>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Load a Study
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-pretty text-muted-foreground">
          Slide your scan into the MRI chamber. The AI will automatically detect
          the imaging modality and route to the correct analysis engine.
        </p>
      </motion.div>

      {/* MRI Scanner Chamber Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
          setVariant('drag')
          setLabel('DROP SCAN')
        }}
        onDragLeave={() => {
          setDragging(false)
          setVariant('default')
          setLabel(null)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          setVariant('default')
          setLabel(null)
          handleFiles(e.dataTransfer.files)
        }}
        onMouseEnter={() => {
          if (!fileName) {
            setVariant('hover')
            setLabel('LOAD SCAN')
          }
        }}
        onMouseLeave={() => {
          setVariant('default')
          setLabel(null)
        }}
        onClick={() => !fileName && inputRef.current?.click()}
        className={`scanner-chamber relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-[2rem] p-10 text-center transition-all duration-500 ${
          dragging ? 'glow-ring-cyan scale-[1.01]' : ''
        } ${scannerActive ? 'glow-ring-blue' : ''}`}
        data-sound="scanner-activate"
      >
        {/* V2 — Mechanical corner locks with glow */}
        {[
          { pos: 'left-4 top-4', border: 'border-l-2 border-t-2', lockX: '-4px', lockY: '-4px' },
          { pos: 'right-4 top-4', border: 'border-r-2 border-t-2', lockX: '4px', lockY: '-4px' },
          { pos: 'left-4 bottom-4', border: 'border-l-2 border-b-2', lockX: '-4px', lockY: '4px' },
          { pos: 'right-4 bottom-4', border: 'border-r-2 border-b-2', lockX: '4px', lockY: '4px' },
        ].map(({ pos, border, lockX, lockY }) => (
          <motion.span
            key={pos}
            className={`absolute h-10 w-10 rounded-[3px] ${pos} ${border}`}
            style={{
              borderColor: scannerActive ? 'rgba(59,130,246,0.8)' : dragging ? 'rgba(34,211,238,0.8)' : 'rgba(34,211,238,0.4)',
              boxShadow: scannerActive
                ? '0 0 16px rgba(59,130,246,0.6)'
                : dragging
                  ? '0 0 12px rgba(34,211,238,0.5)'
                  : 'none',
            }}
            animate={scannerActive ? {
              x: [0, parseInt(lockX)],
              y: [0, parseInt(lockY)],
            } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}

        {/* V2 — Rotating scanner rings */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            className="absolute rounded-full border border-dashed"
            style={{
              width: 280,
              height: 280,
              borderColor: scannerActive ? 'rgba(59,130,246,0.25)' : 'rgba(34,211,238,0.1)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: scannerActive ? 4 : 18, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute rounded-full border"
            style={{
              width: 340,
              height: 340,
              borderColor: scannerActive ? 'rgba(34,211,238,0.2)' : 'rgba(34,211,238,0.06)',
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: scannerActive ? 6 : 24, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute rounded-full border border-dotted"
            style={{
              width: 400,
              height: 400,
              borderColor: 'rgba(167,139,250,0.08)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* V2 — Laser alignment grid */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {/* Horizontal laser */}
          <motion.div
            className="absolute h-[1px] bg-gradient-to-r from-transparent via-cyan/40 to-transparent"
            style={{ width: '70%' }}
            animate={{
              opacity: scannerActive ? [0.3, 0.8, 0.3] : [0.05, 0.15, 0.05],
              scaleX: scannerActive ? [0.8, 1, 0.8] : 1,
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Vertical laser */}
          <motion.div
            className="absolute w-[1px] bg-gradient-to-b from-transparent via-cyan/40 to-transparent"
            style={{ height: '70%' }}
            animate={{
              opacity: scannerActive ? [0.3, 0.8, 0.3] : [0.05, 0.15, 0.05],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          {/* Diagonal lasers */}
          <motion.div
            className="absolute h-[1px] origin-center bg-gradient-to-r from-transparent via-blue/20 to-transparent"
            style={{ width: '50%', transform: 'rotate(45deg)' }}
            animate={{ opacity: scannerActive ? [0.2, 0.5, 0.2] : 0 }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute h-[1px] origin-center bg-gradient-to-r from-transparent via-blue/20 to-transparent"
            style={{ width: '50%', transform: 'rotate(-45deg)' }}
            animate={{ opacity: scannerActive ? [0.2, 0.5, 0.2] : 0 }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.8 }}
          />
        </div>

        {/* Scanning laser — V1 preserved, enhanced */}
        <div className="pointer-events-none absolute inset-x-6 top-0 bottom-0 overflow-hidden">
          <div
            className="animate-scan-line absolute inset-x-0 h-1.5 rounded-full"
            style={{
              background: scannerActive
                ? 'linear-gradient(90deg, transparent, #3b82f6, transparent)'
                : 'rgb(34,211,238)',
              boxShadow: scannerActive
                ? '0 0 24px 6px rgba(59,130,246,0.8)'
                : '0 0 20px 4px rgba(34,211,238,0.8)',
            }}
          />
        </div>

        {/* V2 — Holographic floor grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,211,238,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)',
          }}
        />

        {/* V2 — Depth lighting */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            background: dragging
              ? 'radial-gradient(circle at 50% 50%, rgba(34,211,238,0.08), transparent 70%)'
              : scannerActive
                ? 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.06), transparent 70%)'
                : 'none',
          }}
        />

        <input
          ref={inputRef}
          type="file"
          accept="image/*,.dcm"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <AnimatePresence mode="wait">
          {fileName ? (
            <motion.div
              key="loaded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan/15 text-cyan">
                <ImageIcon className="h-9 w-9" />
                <span className="absolute inset-0 animate-ping rounded-2xl border border-cyan/40" />
              </div>
              <p className="mt-4 font-medium">{fileName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                <Zap className="inline h-3.5 w-3.5 text-cyan mr-1" />
                AI will auto-detect modality
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setFileName(null)
                  setScannerActive(false)
                }}
                className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-critical transition-colors"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 text-cyan"
              >
                <UploadCloud className="h-9 w-9" />
              </motion.div>
              <p className="mt-5 font-display text-lg font-medium">
                Drop scan to begin acquisition
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse · DICOM, PNG, JPG supported
              </p>
              <p className="mt-3 text-xs text-muted-foreground/60">
                AI auto-detection · No manual selection required
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-8 flex justify-center">
        <GlowButton
          disabled={!fileName}
          onClick={handleLaunch}
          className={!fileName ? 'cursor-not-allowed opacity-40' : ''}
        >
          Enter Intelligence Chamber
          <ArrowRight className="h-4 w-4" />
        </GlowButton>
      </div>

      {/* V2 — Sound architecture placeholder */}
      <div data-sound="upload-success" className="hidden" />
    </div>
  )
}
