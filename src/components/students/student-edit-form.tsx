'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Student {
  id: string
  name: string
  nis?: string | null
  className?: string | null
}

interface StudentEditFormProps {
  student: Student
  onClose: () => void
  onSuccess: () => void
}

export default function StudentEditForm({ student, onClose, onSuccess }: StudentEditFormProps) {
  const [formData, setFormData] = useState({
    name: student.name,
    nis: student.nis || '',
    className: student.className || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          nis: formData.nis.trim() || null,
          className: formData.className.trim() || null
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Gagal memperbarui data siswa')
      }

      toast.success('Data siswa berhasil diperbarui!')
      onSuccess()
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // Hanya angka
    setFormData(prev => ({ ...prev, nis: value }))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Data Siswa
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nis">NIS (Nomor Induk Siswa)</Label>
            <Input
              id="nis"
              value={formData.nis}
              onChange={handleNisChange}
              placeholder="Masukkan NIS (hanya angka)"
              maxLength={10}
            />
            <p className="text-xs text-gray-500">
              Opsional. Hanya boleh angka, maksimal 10 digit.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="className">Kelas</Label>
            <Input
              id="className"
              value={formData.className}
              onChange={(e) => setFormData(prev => ({ ...prev, className: e.target.value }))}
              placeholder="Contoh: 1A, 2B, 3C"
            />
            <p className="text-xs text-gray-500">
              Opsional. Contoh: 1A, 2B, 3C
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}