'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AmbientBackground } from '@/components/ambient-background'
import { TopNav, type View } from '@/components/top-nav'
import { LandingHero } from '@/components/landing-hero'
import { DepartmentDashboard } from '@/components/department-dashboard'
import { ScanUploader } from '@/components/scan-uploader'
import { RadiologyChamber } from '@/components/radiology-chamber'
import { AnalysisPipeline } from '@/components/analysis-pipeline'
import { ResultView } from '@/components/result-view'
import { ReportView } from '@/components/report-view'
import { buildResult, type AnalysisResult } from '@/lib/findings'
import { detectModality, type ModalityResult } from '@/lib/modality-detector'

/**
 * V2 — Main application shell.
 *
 * Updated view flow:
 *   landing → dashboard → upload → chamber → analysis → result → report
 *
 * New state:
 *   - detected modality info (departmentId, displayName, organKey)
 *   - chamber view between upload and analysis
 */

export default function Page() {
  const [view, setView] = useState<View>('landing')
  const [fileName, setFileName] = useState('scan.dcm')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [modalityInfo, setModalityInfo] = useState<ModalityResult | null>(null)

  const navigate = useCallback((next: View) => {
    setView(next)
    if (typeof window !== 'undefined')
      window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // V2 — Upload → Chamber flow
  const handleScanReady = useCallback(
    (name: string) => {
      setFileName(name)
      // Auto-detect modality
      const detected = detectModality(name)
      setModalityInfo(detected)
      // Pre-build result for use after pipeline
      setResult(buildResult(name, detected.displayName))
      // Navigate to the Chamber
      navigate('chamber')
    },
    [navigate],
  )

  // V2 — Chamber complete → Analysis Pipeline
  const handleChamberComplete = useCallback(() => {
    navigate('analysis')
  }, [navigate])

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Hide ambient background during chamber (chamber has its own) */}
      {view !== 'chamber' && <AmbientBackground />}
      {/* Hide nav during chamber for full immersion */}
      {view !== 'chamber' && <TopNav view={view} onNavigate={navigate} />}

      {/* Render chamber outside the AnimatePresence's motion.div to preserve fixed positioning */}
      {view === 'chamber' && modalityInfo && (
        <RadiologyChamber
          fileName={fileName}
          detectedModality={modalityInfo.displayName}
          detectedOrganKey={modalityInfo.organKey}
          onComplete={handleChamberComplete}
        />
      )}

      <AnimatePresence mode="wait">
        {view !== 'chamber' && (
          <motion.div
            key={view}
          initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {view === 'landing' && <LandingHero onNavigate={navigate} />}
          {view === 'dashboard' && <DepartmentDashboard onNavigate={navigate} />}
          {view === 'upload' && <ScanUploader onScanReady={handleScanReady} />}
          {view === 'analysis' && (
            <AnalysisPipeline
              fileName={fileName}
              onComplete={() => navigate('result')}
            />
          )}
          {view === 'result' && result && (
            <ResultView result={result} onNavigate={navigate} />
          )}
          {view === 'report' && result && (
            <ReportView result={result} onNavigate={navigate} />
          )}
        </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
