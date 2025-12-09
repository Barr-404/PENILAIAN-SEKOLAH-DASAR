'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Subject {
  id: string
  name: string
  semester: string | null
  _count: { students: number }
}

interface SubjectsListProps {
  subjects: Subject[]
}

export default function SubjectsList({ subjects }: SubjectsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (subjectId: string) => {
    // Gunakan window.confirm sebagai fallback, tetapi dengan style yang lebih baik
    const userConfirmed = window.confirm(
      'Apakah Anda yakin ingin menghapus mata pelajaran ini?\n\nSemua data siswa dan nilai akan ikut terhapus dan tidak dapat dikembalikan.'
    )
    
    if (!userConfirmed) {
      return
    }

    setDeletingId(subjectId)
    
    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Mata pelajaran berhasil dihapus')
        window.location.reload()
      } else {
        toast.error(data.error || 'Gagal menghapus mata pelajaran')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Terjadi kesalahan saat menghapus mata pelajaran')
    } finally {
      setDeletingId(null)
    }
  }

  if (subjects.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Belum ada mata pelajaran
          </h3>
          <p className="mt-2 text-gray-500">
            Mulai dengan menambahkan mata pelajaran pertama Anda.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/subjects/new">
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Tambah Mata Pelajaran
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map((subject) => (
        <Card key={subject.id} className="group hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-blue-300 overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl font-bold text-gray-800 mb-2 break-words">
                  {subject.name}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  {subject.semester && (
                    <Badge 
                      variant="secondary" 
                      className={`font-medium ${
                        subject.semester === 'Ganjil'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {subject.semester === 'Ganjil' ? '📅 Ganjil' : '📅 Genap'}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link href={`/dashboard/subjects/${subject.id}/edit`}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    title="Edit mata pelajaran"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(subject.id)}
                  disabled={deletingId === subject.id}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  title="Hapus mata pelajaran"
                >
                  {deletingId === subject.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {/* Statistik Siswa */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-700">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Siswa</p>
                    <p className="text-xl font-bold text-gray-800">{subject._count.students}</p>
                  </div>
                </div>
              </div>
              
              {/* Tombol Kelola */}
              <Link 
                href={`/dashboard/subjects/${subject.id}`}
                className="block w-full"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 h-11">
                  <Users className="mr-2 h-4 w-4" />
                  Kelola Siswa & Nilai
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}