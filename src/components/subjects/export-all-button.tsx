'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'

// Export all subjects button component
export default function ExportAllButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportAll = async () => {
    try {
      setIsExporting(true)
      toast.loading('Mengexport semua mata pelajaran...', { id: 'export-all' })
      
      const response = await fetch('/api/export')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      
      const contentDisposition = response.headers.get('Content-Disposition')
      const fileName = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'Nilai_Semua_Mapel.xlsx'
      
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('File Excel berhasil didownload', { id: 'export-all' })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Gagal mengekspor data', { id: 'export-all' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      size="lg"
      onClick={handleExportAll}
      disabled={isExporting}
      className="w-full sm:w-auto bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 h-11 sm:h-12 px-4 sm:px-6"
    >
      <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
      <span className="hidden sm:inline">{isExporting ? 'Mengexport...' : 'Export Semua ke Excel'}</span>
      <span className="sm:hidden">{isExporting ? 'Mengexport...' : 'Export Semua'}</span>
    </Button>
  )
}
