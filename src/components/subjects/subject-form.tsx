'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ComboSelect from '@/components/ui/combo-select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SubjectForm() {
  const [name, setName] = useState('')
  const [semester, setSemester] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Daftar mata pelajaran sekolah dasar
  const mataPelajaranList = [
    'Pendidikan Pancasila',
    'Bahasa Indonesia', 
    'Matematika',
    'Ilmu Pengetahuan Alam dan Sosial',
    'Seni Rupa',
    'Bahasa Daerah',
    'Pendidikan Agama Islam',
    'Pendidikan Jasmani (PJOK)',
    'Bahasa Inggris'
  ]

  // Daftar semester
  const semesterList = [
    'Ganjil',
    'Genap'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, semester: semester || null }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard/subjects')
        router.refresh()
      } else {
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="border-b bg-gray-50/50">
        <CardTitle className="text-xl font-semibold text-gray-900">Informasi Mata Pelajaran</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">1</span>
              Nama Mata Pelajaran
            </label>
            <ComboSelect
              value={name}
              onChange={setName}
              placeholder="Pilih atau ketik nama mata pelajaran"
              options={mataPelajaranList}
            />
            <p className="text-xs text-gray-500 ml-8">
              Pilih dari daftar atau ketik mata pelajaran lainnya
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="semester" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">2</span>
              Semester <span className="text-gray-400 font-normal">(Opsional)</span>
            </label>
            <ComboSelect
              value={semester}
              onChange={setSemester}
              placeholder="Pilih semester"
              options={semesterList}
            />
            <p className="text-xs text-gray-500 ml-8">
              Pilih semester untuk mata pelajaran ini (opsional)
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-6 shadow-md"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                'Simpan Mata Pelajaran'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
              className="font-medium"
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}