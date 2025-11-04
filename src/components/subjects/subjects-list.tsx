'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

interface Subject {
  id: string
  name: string
  _count: { students: number }
}

interface SubjectsListProps {
  subjects: Subject[]
}

export default function SubjectsList({ subjects }: SubjectsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (subjectId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
      return
    }

    setDeletingId(subjectId)
    
    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Gagal menghapus mata pelajaran')
      }
    } catch (error) {
      alert('Terjadi kesalahan')
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
        <Card key={subject.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{subject.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/subjects/${subject.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(subject.id)}
                  disabled={deletingId === subject.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{subject._count.students} siswa</span>
              </div>
              
              <div className="flex gap-2">
                <Link 
                  href={`/dashboard/subjects/${subject.id}`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    Lihat Detail
                  </Button>
                </Link>
                <Link 
                  href={`/dashboard/subjects/${subject.id}`}
                  className="flex-1"
                >
                  <Button className="w-full">
                    Kelola Siswa
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}