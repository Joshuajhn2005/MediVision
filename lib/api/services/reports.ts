/**
 * Reports Service
 *
 * Handle report generation and PDF export.
 * Reports are generated server-side by FastAPI.
 */

import { apiConfig } from '@/lib/api/config'
import { httpClient, fetchWithMockFallback } from '@/lib/api/client'
import {
  getMockExportResponse,
  simulateMockDelay,
} from '@/lib/api/mock-responses'
import type {
  ExportResponse,
  ReportData,
} from '@/lib/types/api'

/**
 * Export analysis as PDF
 */
export async function exportReportPDF(
  analysisId: string,
  reportData?: ReportData
): Promise<ExportResponse> {
  return fetchWithMockFallback(
    async () => {
      return httpClient.post<ExportResponse>(
        apiConfig.endpoints.reportExport(analysisId),
        reportData || { analysis_id: analysisId },
        {
          timeout: apiConfig.timeouts.export,
          retryOptions: { maxRetries: 2 },
        }
      )
    },
    async () => {
      // Simulate PDF generation time
      await simulateMockDelay(1500)
      return getMockExportResponse(analysisId)
    }
  )
}

/**
 * Download PDF from URL
 */
export async function downloadPDF(
  pdfUrl: string,
  fileName: string
): Promise<void> {
  if (pdfUrl.startsWith('data:')) {
    // Handle data URLs
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    // Fetch and download remote URL
    const response = await fetch(pdfUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
  }
}

/**
 * Get report preview (for display before export)
 */
export async function getReportPreview(
  analysisId: string
): Promise<{ html: string; data: ReportData }> {
  if (apiConfig.useMockApi) {
    await simulateMockDelay(300)
    return {
      html: `<html><body>Report for ${analysisId}</body></html>`,
      data: {
        analysis_id: analysisId,
        scan_date: new Date().toISOString(),
        modality: 'brain_mri',
        model_name: 'brain-tumor',
        findings: ['Sample finding'],
        overall_confidence: 0.92,
        recommendations: ['Follow-up recommended'],
      },
    }
  }

  return httpClient
    .get<{ html: string; data: ReportData }>(
      `${apiConfig.endpoints.analysisResult(analysisId)}/report-preview`,
      { timeout: apiConfig.timeouts.default }
    )
    .then((response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error.message)
    })
}
