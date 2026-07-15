'use client'

import { motion } from 'motion/react'
import { Activity, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * V2 — Enhanced navigation with patient journey breadcrumbs.
 *
 * Now includes 'chamber' in the View type and a visual journey
 * progress indicator showing: Intake → Acquisition → Chamber →
 * Inference → Review → Report
 */

export type View = 'landing' | 'dashboard' | 'upload' | 'chamber' | 'analysis' | 'result' | 'report'

interface TopNavProps {
  view: View
  onNavigate: (view: View) => void
}

const links: { label: string; view: View }[] = [
  { label: 'Overview', view: 'landing' },
  { label: 'Departments', view: 'dashboard' },
  { label: 'New Analysis', view: 'upload' },
]

// V2 — Patient journey steps (shown as breadcrumb trail)
const journeySteps: { label: string; views: View[] }[] = [
  { label: 'Intake', views: ['landing', 'dashboard'] },
  { label: 'Acquisition', views: ['upload'] },
  { label: 'Chamber', views: ['chamber'] },
  { label: 'Inference', views: ['analysis'] },
  { label: 'Review', views: ['result'] },
  { label: 'Report', views: ['report'] },
]

function getJourneyIndex(view: View): number {
  const idx = journeySteps.findIndex((s) => s.views.includes(view))
  return idx >= 0 ? idx : 0
}

export function TopNav({ view, onNavigate }: TopNavProps) {
  const journeyIdx = getJourneyIndex(view)
  const showJourney = view !== 'landing'

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-50 flex flex-col items-center px-4 pt-4 gap-2"
    >
      <nav className="glass-strong flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-2.5 pl-5">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 outline-none"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-cyan/15 text-cyan">
            <ScanLine className="h-4 w-4" />
            <span className="absolute inset-0 animate-ping rounded-xl border border-cyan/40" />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight">
            MedVision<span className="text-cyan">AI</span>
          </span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <button
              key={l.view}
              onClick={() => onNavigate(l.view)}
              className={cn(
                'relative rounded-full px-4 py-1.5 text-sm transition-colors',
                view === l.view
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {view === l.view && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-cyan/12 ring-1 ring-cyan/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{l.label}</span>
            </button>
          ))}
        </div>

        {/* V2 — Enhanced AI status with live pulse */}
        <div className="flex items-center gap-2 rounded-full bg-emerald/10 px-3 py-1.5 text-xs text-emerald">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Activity className="h-3.5 w-3.5" />
          </motion.div>
          <span className="font-mono">AI ONLINE</span>
        </div>
      </nav>

      {/* V2 — Patient Journey Breadcrumb Trail */}
      {showJourney && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:flex items-center gap-1 rounded-full glass px-4 py-1.5"
        >
          {journeySteps.map((step, i) => {
            const isActive = i === journeyIdx
            const isDone = i < journeyIdx
            const isPending = i > journeyIdx
            return (
              <div key={step.label} className="flex items-center gap-1">
                {i > 0 && (
                  <div className={cn(
                    'h-px w-4 transition-all duration-500',
                    isDone ? 'bg-cyan/60' : 'bg-white/10',
                  )} />
                )}
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className={cn(
                      'h-2 w-2 rounded-full transition-all duration-500',
                      isActive ? 'bg-cyan' : isDone ? 'bg-cyan/50' : 'bg-white/15',
                    )}
                    animate={isActive ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={isActive ? { boxShadow: '0 0 8px rgba(34,211,238,0.8)' } : {}}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-mono uppercase tracking-widest transition-colors duration-500',
                      isActive ? 'text-cyan' : isDone ? 'text-cyan/50' : 'text-muted-foreground/40',
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            )
          })}
        </motion.div>
      )}
    </motion.header>
  )
}
