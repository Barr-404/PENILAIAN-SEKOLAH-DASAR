'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Subject {
  id: string
  name: string
  semester: string | null
}

interface SubjectEditFormProps {
  subject: Subject
}

export default function SubjectEditForm({ subject }: SubjectEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: subject.name,
    semester: subject.semester || 'Ganjil'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Nama mata pelajaran wajib diisi')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/subjects/${subject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          semester: formData.semester || null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Mata pelajaran berhasil diperbarui!')
        router.push('/dashboard/subjects')
        router.refresh()
      } else {
        toast.error(data.error || 'Gagal memperbarui mata pelajaran')
      }
    } catch (error) {
      console.error('Edit error:', error)
      toast.error('Terjadi kesalahan saat memperbarui')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/subjects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <CardTitle>Form Edit Mata Pelajaran</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama Mata Pelajaran */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Mata Pelajaran <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Matematika, Bahasa Indonesia"
              required
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500">
              Masukkan nama mata pelajaran yang Anda ajar
            </p>
          </div>

          {/* Semester */}
          <div className="space-y-2">
            <Label htmlFor="semester">Semester (Opsional)</Label>
            <Select
              value={formData.semester || "none"}
              onValueChange={(value) => setFormData({ ...formData, semester: value === "none" ? "" : value })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada semester spesifik</SelectItem>
                <SelectItem value="Ganjil">Semester Ganjil</SelectItem>
                <SelectItem value="Genap">Semester Genap</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Pilih semester jika diperlukan
            </p>
          </div>

          {/* Tombol Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
            <Link href="/dashboard/subjects" className="flex-1">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="w-full"
              >
                Batal
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
