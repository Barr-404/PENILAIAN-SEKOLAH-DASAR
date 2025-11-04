'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Download, Edit, Trash2, Users, BookOpen, Filter } from 'lucide-react'
import StudentForm from '@/components/students/student-form'
import StudentEditForm from '@/components/students/student-edit-form'
import GradeForm from '@/components/students/grade-form'

interface Subject {
  id: string
  name: string
  students: Array<{
    id: string
    name: string
    nis?: string | null
    className?: string | null
    grades: Array<{
      id: string
      // Kolom lama (untuk backward compatibility)
      tugas?: number | null
      ulangan?: number | null
      // Kolom baru
      tugasHarian?: number | null
      ulanganTengahSemester?: number | null
      ulanganAkhirSemester?: number | null
      average?: number | null
    }>
  }>
  teacher: {
    name?: string | null
    email?: string | null
  }
}

interface SubjectDetailPageProps {
  subject: Subject
}

export default function SubjectDetailPage({ subject }: SubjectDetailPageProps) {
  const router = useRouter()
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [editingGrade, setEditingGrade] = useState<string | null>(null)
  const [editingStudent, setEditingStudent] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')

  // Dapatkan daftar kelas unik
  const availableClasses = Array.from(
    new Set(subject.students.map(s => s.className).filter((className): className is string => Boolean(className)))
  ).sort()

  // Filter siswa berdasarkan pencarian dan kelas
  const filteredStudents = subject.students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.nis && student.nis.includes(searchTerm)) ||
      (student.className && student.className.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesClass = selectedClass === 'all' || student.className === selectedClass
    
    return matchesSearch && matchesClass
  })

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/export?subjectId=${subject.id}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        
        const contentDisposition = response.headers.get('Content-Disposition')
        const fileName = contentDisposition 
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : `Nilai_${subject.name}_${subject.teacher.name}.xlsx`
        
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Gagal mengexport data')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Terjadi kesalahan saat export')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            {subject.name}
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            {subject.students.length} siswa terdaftar
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={subject.students.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          
          <Button onClick={() => setShowAddStudent(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Siswa
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian Siswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Cari berdasarkan nama, NIS, atau kelas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {availableClasses.map((className) => (
                    <SelectItem key={className} value={className}>
                      Kelas {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Menampilkan {filteredStudents.length} dari {subject.students.length} siswa
          </div>
        </CardContent>
      </Card>

      {/* Daftar Siswa */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'Tidak ada siswa yang ditemukan' : 'Belum ada siswa'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Coba ubah kata kunci pencarian' 
                : 'Mulai dengan menambahkan siswa pertama'
              }
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button onClick={() => setShowAddStudent(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Siswa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map((student) => {
            const grade = student.grades[0] // Ambil grade pertama
            
            return (
              <Card key={student.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{student.name}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {student.nis && <span>NIS: {student.nis}</span>}
                        {student.nis && student.className && <span> • </span>}
                        {student.className && <span>Kelas: {student.className}</span>}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center min-w-[400px]">
                      <div>
                        <p className="text-xs text-gray-500">Tugas Harian</p>
                        <p className="font-medium">
                          {grade?.tugasHarian ? grade.tugasHarian.toFixed(1) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">UTS</p>
                        <p className="font-medium">
                          {grade?.ulanganTengahSemester ? grade.ulanganTengahSemester.toFixed(1) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">UAS</p>
                        <p className="font-medium">
                          {grade?.ulanganAkhirSemester ? grade.ulanganAkhirSemester.toFixed(1) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rata-rata</p>
                        <p className="font-medium text-blue-600">
                          {grade?.average ? grade.average.toFixed(1) : '-'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingStudent(student.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Data
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingGrade(student.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Nilai
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Tambah Siswa */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Tambah Siswa Baru</h2>
            <StudentForm 
              subjectId={subject.id}
              onSuccess={() => {
                setShowAddStudent(false)
                router.refresh()
              }}
              onCancel={() => setShowAddStudent(false)}
            />
          </div>
        </div>
      )}

      {/* Modal Edit Nilai */}
      {editingGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Nilai Siswa</h2>
            <GradeForm
              studentId={editingGrade}
              currentGrade={
                subject.students
                  .find(s => s.id === editingGrade)
                  ?.grades[0]
              }
              onSuccess={() => {
                setEditingGrade(null)
                router.refresh()
              }}
              onCancel={() => setEditingGrade(null)}
            />
          </div>
        </div>
      )}

      {/* Modal Edit Data Siswa */}
      {editingStudent && (
        <StudentEditForm
          student={subject.students.find(s => s.id === editingStudent)!}
          onClose={() => setEditingStudent(null)}
          onSuccess={() => {
            setEditingStudent(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}