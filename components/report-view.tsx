'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { Printer, ArrowLeft, ScanLine, ShieldAlert, QrCode, Fingerprint, FileText } from 'lucide-react'
import type { AnalysisResult } from '@/lib/findings'
import { GlowButton } from '@/components/glow-button'
import type { View } from '@/components/top-nav'

/**
 * V2 — Enhanced Professional Hospital Report
 *
 * Additions:
 *  - Hospital Branding section with logo area
 *  - QR Verification placeholder
 *  - Digital Signature placeholder
 *  - Clinical Notes section (textarea placeholder)
 *  - Enhanced Radiologist Signature with name/credential fields
 *  - HIPAA compliance notice
 *  - All V1 sections preserved
 */

export function ReportView({
  result,
  onNavigate,
}: {
  result: AnalysisResult
  onNavigate: (v: View) => void
}) {
  return (
    <div className="mx-auto max-w-4xl px-5 pt-28 pb-20">
      {/* Controls (hidden when printing) */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <GlowButton variant="ghost" onClick={() => onNavigate('result')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Viewer
        </GlowButton>
        <GlowButton onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Export PDF
        </GlowButton>
      </div>

      {/* Report sheet */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-strong overflow-hidden rounded-[1.75rem] print:rounded-none print:bg-white print:text-black"
      >
        {/* V2 — Enhanced Letterhead with Hospital Branding */}
        <div className="border-b border-white/8 bg-cyan/5 px-8 py-6 print:bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan/15 text-cyan print:bg-cyan/20">
                <ScanLine className="h-7 w-7" />
              </span>
              <div>
                <div className="font-display text-xl font-semibold">
                  MedVision AI
                </div>
                <div className="text-xs text-muted-foreground">
                  Advanced Radiology Intelligence Platform
                </div>
                <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                  Preliminary AI-Assisted Radiology Report
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-muted-foreground">
                REPORT #{result.patientId}
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {result.studyDate}
              </div>
              {/* V2 — Accreditation line */}
              <div className="font-mono text-[9px] text-muted-foreground/50 mt-1">
                AI ENGINE v2.3 · FDA 510(k) Pending
              </div>
            </div>
          </div>
          {/* V2 — Report type banner */}
          <div className="mt-4 flex items-center gap-2 text-xs text-amber border-t border-white/5 pt-3">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span className="uppercase tracking-widest font-medium">
              Preliminary AI-Generated Report — Requires Radiologist Validation
            </span>
          </div>
        </div>

        <div className="space-y-8 px-8 py-8">
          {/* Patient info — V1 preserved */}
          <Section title="Patient Information">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              <Field label="Patient" value={result.patientName} />
              <Field label="Patient ID" value={result.patientId} />
              <Field label="Age" value={`${result.age} yrs`} />
              <Field label="Sex" value={result.sex} />
            </dl>
          </Section>

          {/* Study — V1 preserved + V2 extras */}
          <Section title="Study Details">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              <Field label="Study Type" value={result.studyType} />
              <Field label="Study Date" value={result.studyDate} />
              <Field label="AI Confidence" value={`${result.overallConfidence}%`} />
              <Field label="Severity" value={result.severity} />
              <Field label="Accession #" value={`ACC-${result.patientId.slice(3)}`} />
              <Field label="Referring Physician" value="[Pending]" />
              <Field label="AI Model" value="MedVision CNN v2.3" />
              <Field label="Processing Time" value="< 12 seconds" />
            </dl>
          </Section>

          {/* Visual evidence — V1 preserved */}
          <Section title="Visual Evidence">
            <div className="grid gap-4 sm:grid-cols-2">
              <figure className="overflow-hidden rounded-xl border border-white/10">
                <div className="relative aspect-square">
                  <Image
                    src="/chest-xray.png"
                    alt="Original radiograph"
                    fill
                    className="object-cover"
                  />
                </div>
                <figcaption className="bg-white/5 px-3 py-2 text-center text-xs text-muted-foreground">
                  Original acquisition
                </figcaption>
              </figure>
              <figure className="overflow-hidden rounded-xl border border-white/10">
                <div className="relative aspect-square">
                  <Image
                    src="/chest-xray.png"
                    alt="AI attention heatmap"
                    fill
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 mix-blend-screen"
                    style={{
                      background:
                        'radial-gradient(circle at 63% 66%, rgba(251,87,121,0.8), rgba(251,191,36,0.4) 24%, transparent 52%)',
                    }}
                  />
                </div>
                <figcaption className="bg-white/5 px-3 py-2 text-center text-xs text-muted-foreground">
                  Grad-CAM attention map
                </figcaption>
              </figure>
            </div>
          </Section>

          {/* Findings — V1 preserved */}
          <Section title="AI Findings">
            <ul className="divide-y divide-white/8 rounded-xl border border-white/8">
              {result.findings.map((f) => (
                <li
                  key={f.label}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      f.tone === 'critical' ? 'bg-critical' : f.tone === 'attention' ? 'bg-amber' : 'bg-emerald'
                    }`} />
                    {f.label}
                  </span>
                  <span className="font-mono text-xs text-cyan">
                    {f.confidence}% conf.
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-surface-foreground">
                Impression:{' '}
              </span>
              {result.summary}
            </p>
          </Section>

          {/* Recommendations — V1 preserved */}
          <Section title="Recommendations">
            <ul className="ml-4 list-disc space-y-1.5 text-sm text-muted-foreground">
              {result.nextSteps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </Section>

          {/* V2 — Clinical Notes Section */}
          <Section title="Clinical Notes">
            <div className="rounded-xl border border-white/8 bg-white/3 p-4 min-h-[80px]">
              <p className="text-xs text-muted-foreground/50 italic">
                [Radiologist clinical notes to be added during review]
              </p>
            </div>
          </Section>

          {/* Disclaimer — V1 preserved, V2 enhanced with HIPAA */}
          <div className="flex items-start gap-3 rounded-xl border border-amber/25 bg-amber/8 p-4 text-xs text-amber print:border-amber/40">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-2">
              <p>
                DISCLAIMER: This report was generated by an AI system and represents
                a preliminary assessment only. It is not a medical diagnosis and
                must be reviewed and validated by a qualified radiologist before any
                clinical action is taken. MedVision AI assumes no liability for
                decisions made based on this document.
              </p>
              {/* V2 — HIPAA notice */}
              <p className="text-amber/60">
                HIPAA NOTICE: This document may contain Protected Health Information (PHI).
                It is intended solely for the use of the authorized recipient(s).
                Unauthorized access, use, or disclosure is prohibited under 45 CFR Parts 160 and 164.
              </p>
            </div>
          </div>

          {/* V2 — Signature & Verification Block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/8">
            {/* Radiologist Signature */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground uppercase tracking-widest">
                Reviewing Radiologist
              </div>
              <div className="h-12 w-full border-b border-dashed border-white/20" />
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="h-5 w-36 border-b border-dotted border-white/10" />
                <p className="text-[10px]">Name, MD · Board Certification</p>
              </div>
            </div>

            {/* V2 — Digital Signature */}
            <div className="space-y-2 flex flex-col items-center">
              <div className="text-xs text-muted-foreground uppercase tracking-widest">
                Digital Signature
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/3">
                <Fingerprint className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-[10px] text-muted-foreground/50">PKI Signature Pending</p>
            </div>

            {/* V2 — QR Verification */}
            <div className="space-y-2 flex flex-col items-center sm:items-end">
              <div className="text-xs text-muted-foreground uppercase tracking-widest">
                QR Verification
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/3">
                <QrCode className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-[10px] text-muted-foreground/50">Scan to verify authenticity</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] text-muted-foreground/50">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              Generated {result.studyDate} · MedVision AI v2.3
            </div>
            <div>
              Page 1 of 1 · Confidential Medical Document
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  )
}

/* ——— Sub-components (V1 preserved) ——— */

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  )
}
