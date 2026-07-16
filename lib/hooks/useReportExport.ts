/**
 * useReportExport Hook
 *
 * Manage report export workflow: generate PDF, track progress, handle errors.
 */

import { useState, useCallback } from 'react'
import { ApiError } from '@/lib/api/errors'
import { exportReportPDF, downloadPDF } from '@/lib/api/services/reports'
import type { ReportData } from '@/lib/types/api'

interface UseReportExportState {
  isExporting: boolean
  error: ApiError | null
  progress: number
}

interface UseReportExportReturn extends UseReportExportState {
  export: (analysisId: string, reportData?: ReportData) => Promise<void>
  download: (pdfUrl: string, fileName: string) => Promise<void>
  reset: () => void
}

export function useReportExport(): UseReportExportReturn {
  const [state, setState] = useState<UseReportExportState>({
    isExporting: false,
    error: null,
    progress: 0,
  })

  const exportReport = useCallback(
    async (analysisId: string, reportData?: ReportData) => {
      setState({
        isExporting: true,
        error: null,
        progress: 0,
      })

      try {
        // Generate PDF on backend
        setState((prev) => ({ ...prev, progress: 50 }))
        const response = await exportReportPDF(analysisId, reportData)

        // Download PDF
        setState((prev) => ({ ...prev, progress: 75 }))
        await downloadPDF(response.pdf_url, response.file_name)

        setState({
          isExporting: false,
          error: null,
          progress: 100,
        })
      } catch (err) {
        const error =
          err instanceof ApiError
            ? err
            : new ApiError('EXPORT_ERROR', 'Failed to export report')

        setState({
          isExporting: false,
          error,
          progress: 0,
        })

        throw error
      }
    },
    []
  )

  const download = useCallback(async (pdfUrl: string, fileName: string) => {
    try {
      setState((prev) => ({ ...prev, progress: 50 }))
      await downloadPDF(pdfUrl, fileName)
      setState((prev) => ({ ...prev, progress: 100 }))
    } catch (err) {
      const error = new ApiError('DOWNLOAD_ERROR', 'Failed to download PDF')
      setState({
        isExporting: false,
        error,
        progress: 0,
      })
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isExporting: false,
      error: null,
      progress: 0,
    })
  }, [])

  return {
    ...state,
    export: exportReport,
    download,
    reset,
  }
}
