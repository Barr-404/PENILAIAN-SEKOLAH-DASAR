'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface StudentFormProps {
  subjectId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function StudentForm({ subjectId, onSuccess, onCancel }: StudentFormProps) {
  const [name, setName] = useState('')
  const [nis, setNis] = useState('')
  const [className, setClassName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          nis: nis.trim() || null,
          className: className.trim() || null,
          subjectId
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nama Siswa *
        </label>
        <Input
          id="name"
          type="text"
          placeholder="Nama lengkap siswa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="nis" className="text-sm font-medium">
          NIS (Opsional)
        </label>
        <Input
          id="nis"
          type="text"
          placeholder="Nomor Induk Siswa"
          value={nis}
          onChange={(e) => setNis(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="className" className="text-sm font-medium">
          Kelas (Opsional)
        </label>
        <Input
          id="className"
          type="text"
          placeholder="Contoh: 5A, 6B"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  )
}