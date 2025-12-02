'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

interface Grade {
  id: string
  lm1_tp1?: number | null
  lm1_sum?: number | null
  semester_final?: number | null
  average?: number | null
}

interface GradeFormProps {
  studentId: string
  currentGrade?: Grade
  onSuccess: () => void
  onCancel: () => void
}

export default function GradeForm({ studentId, currentGrade, onSuccess, onCancel }: GradeFormProps) {
  const [lm1_tp1, setLm1Tp1] = useState('')
  const [lm1_sum, setLm1Sum] = useState('')
  const [semester_final, setSemesterFinal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (currentGrade) {
      setLm1Tp1(currentGrade.lm1_tp1?.toString() || '')
      setLm1Sum(currentGrade.lm1_sum?.toString() || '')
      setSemesterFinal(currentGrade.semester_final?.toString() || '')
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
          lm1_tp1: lm1_tp1 ? parseFloat(lm1_tp1) : null,
          lm1_sum: lm1_sum ? parseFloat(lm1_sum) : null,
          semester_final: semester_final ? parseFloat(semester_final) : null
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
          <label htmlFor="lm1_tp1" className="block text-sm font-medium text-gray-700 mb-2">
            LM1 TP1 (0-100)
          </label>
          <Input
            id="lm1_tp1"
            type="text"
            placeholder="Masukkan nilai LM1 TP1"
            value={lm1_tp1}
            onChange={(e) => handleNumberInput(e.target.value, setLm1Tp1)}
            className="text-center font-medium"
          />
        </div>

        <div>
          <label htmlFor="lm1_sum" className="block text-sm font-medium text-gray-700 mb-2">
            LM1 Sumatif (0-100)
          </label>
          <Input
            id="lm1_sum"
            type="text"
            placeholder="Masukkan nilai LM1 Sumatif"
            value={lm1_sum}
            onChange={(e) => handleNumberInput(e.target.value, setLm1Sum)}
            className="text-center font-medium"
          />
        </div>

        <div>
          <label htmlFor="semester_final" className="block text-sm font-medium text-gray-700 mb-2">
            Sumatif Akhir Semester (0-100)
          </label>
          <Input
            id="semester_final"
            type="text"
            placeholder="Masukkan nilai Sumatif Akhir Semester"
            value={semester_final}
            onChange={(e) => handleNumberInput(e.target.value, setSemesterFinal)}
            className="text-center font-medium"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
        <p className="text-sm text-blue-800 flex items-center gap-2">
          <span className="text-blue-600">ℹ️</span>
          <span><strong>Info:</strong> Masukkan nilai untuk setiap kategori.</span>
        </p>
        {lm1_tp1 && lm1_sum && semester_final && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <span className="text-sm font-medium text-green-800">
              Rata-rata: <span className="text-lg">{((parseFloat(lm1_tp1) + parseFloat(lm1_sum) + parseFloat(semester_final)) / 3).toFixed(1)}</span>
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