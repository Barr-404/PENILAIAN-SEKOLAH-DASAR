'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ComboSelect from '@/components/ui/combo-select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SubjectForm() {
  const [name, setName] = useState('')
  const [kelas, setKelas] = useState('')
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

  // Daftar kelas sekolah dasar
  const kelasList = [
    'Kelas 1',
    'Kelas 2',
    'Kelas 3',
    'Kelas 4',
    'Kelas 5',
    'Kelas 6'
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
        body: JSON.stringify({ name, kelas: kelas || null, semester: semester || null }),
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
    <Card>
      <CardHeader>
        <CardTitle>Informasi Mata Pelajaran</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nama Mata Pelajaran
            </label>
            <ComboSelect
              value={name}
              onChange={setName}
              placeholder="Pilih atau ketik nama mata pelajaran"
              options={mataPelajaranList}
            />
            <p className="text-xs text-gray-500">
              Pilih dari daftar atau ketik mata pelajaran lainnya
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="kelas" className="text-sm font-medium">
              Daftar Kelas <span className="text-gray-400">(Opsional)</span>
            </label>
            <ComboSelect
              value={kelas}
              onChange={setKelas}
              placeholder="Pilih atau ketik daftar kelas"
              options={kelasList}
            />
            <p className="text-xs text-gray-500">
              Pilih dari daftar atau ketik kelas lainnya (opsional)
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="semester" className="text-sm font-medium">
              Semester <span className="text-gray-400">(Opsional)</span>
            </label>
            <ComboSelect
              value={semester}
              onChange={setSemester}
              placeholder="Pilih semester"
              options={semesterList}
            />
            <p className="text-xs text-gray-500">
              Pilih semester untuk mata pelajaran ini (opsional)
            </p>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}