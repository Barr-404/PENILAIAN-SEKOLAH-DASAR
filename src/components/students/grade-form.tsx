'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

interface Grade {
  id: string
  tugasHarian?: number | null
  ulanganTengahSemester?: number | null
  ulanganAkhirSemester?: number | null
  average?: number | null
}

interface GradeFormProps {
  studentId: string
  currentGrade?: Grade
  onSuccess: () => void
  onCancel: () => void
}

export default function GradeForm({ studentId, currentGrade, onSuccess, onCancel }: GradeFormProps) {
  const [tugasHarian, setTugasHarian] = useState('')
  const [ulanganTengahSemester, setUlanganTengahSemester] = useState('')
  const [ulanganAkhirSemester, setUlanganAkhirSemester] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (currentGrade) {
      setTugasHarian(currentGrade.tugasHarian?.toString() || '')
      setUlanganTengahSemester(currentGrade.ulanganTengahSemester?.toString() || '')
      setUlanganAkhirSemester(currentGrade.ulanganAkhirSemester?.toString() || '')
    }
  }, [currentGrade])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          tugasHarian: tugasHarian ? parseFloat(tugasHarian) : null,
          ulanganTengahSemester: ulanganTengahSemester ? parseFloat(ulanganTengahSemester) : null,
          ulanganAkhirSemester: ulanganAkhirSemester ? parseFloat(ulanganAkhirSemester) : null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Nilai berhasil disimpan!')
        onSuccess()
      } else {
        const errorMsg = data.error || 'Terjadi kesalahan'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      const errorMsg = 'Terjadi kesalahan. Silakan coba lagi.'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNumberInput = (value: string, setter: (val: string) => void) => {
    // Hanya izinkan angka dan titik desimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      // Pastikan nilai antara 0-100
      const num = parseFloat(value)
      if (value === '' || (num >= 0 && num <= 100)) {
        setter(value)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="tugasHarian" className="block text-sm font-medium text-gray-700 mb-2">
            Tugas Harian (0-100)
          </label>
          <Input
            id="tugasHarian"
            type="text"
            placeholder="Masukkan nilai tugas harian"
            value={tugasHarian}
            onChange={(e) => handleNumberInput(e.target.value, setTugasHarian)}
            className="text-center font-medium"
          />
        </div>

        <div>
          <label htmlFor="ulanganTengahSemester" className="block text-sm font-medium text-gray-700 mb-2">
            Ulangan Tengah Semester (0-100)
          </label>
          <Input
            id="ulanganTengahSemester"
            type="text"
            placeholder="Masukkan nilai UTS"
            value={ulanganTengahSemester}
            onChange={(e) => handleNumberInput(e.target.value, setUlanganTengahSemester)}
            className="text-center font-medium"
          />
        </div>

        <div>
          <label htmlFor="ulanganAkhirSemester" className="block text-sm font-medium text-gray-700 mb-2">
            Ulangan Akhir Semester (0-100)
          </label>
          <Input
            id="ulanganAkhirSemester"
            type="text"
            placeholder="Masukkan nilai UAS"
            value={ulanganAkhirSemester}
            onChange={(e) => handleNumberInput(e.target.value, setUlanganAkhirSemester)}
            className="text-center font-medium"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
        <p className="text-sm text-blue-800 flex items-center gap-2">
          <span className="text-blue-600">ℹ️</span>
          <span><strong>Info:</strong> Rata-rata akan dihitung otomatis jika semua nilai diisi.</span>
        </p>
        {tugasHarian && ulanganTengahSemester && ulanganAkhirSemester && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <span className="text-sm font-medium text-green-800">
              Rata-rata: <span className="text-lg">{((parseFloat(tugasHarian) + parseFloat(ulanganTengahSemester) + parseFloat(ulanganAkhirSemester)) / 3).toFixed(1)}</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-6 border-t border-gray-200">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan Nilai'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          Batal
        </Button>
      </div>
    </form>
  )
}