'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Download, Users, BookOpen } from 'lucide-react'
import StudentEditForm from '@/components/students/student-edit-form'
import GradeForm from '@/components/students/grade-form'
import GradesTable from '@/components/grades/grades-table'
import toast from 'react-hot-toast'

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
      lm1_tp1?: number | null
      lm1_tp2?: number | null
      lm1_tp3?: number | null
      lm1_tp4?: number | null
      lm1_sum?: number | null
      lm2_tp1?: number | null
      lm2_tp2?: number | null
      lm2_tp3?: number | null
      lm2_tp4?: number | null
      lm2_sum?: number | null
      lm3_tp1?: number | null
      lm3_tp2?: number | null
      lm3_tp3?: number | null
      lm3_tp4?: number | null
      lm3_sum?: number | null
      lm4_tp1?: number | null
      lm4_tp2?: number | null
      lm4_tp3?: number | null
      lm4_tp4?: number | null
      lm4_sum?: number | null
      lm5_tp1?: number | null
      lm5_tp2?: number | null
      lm5_tp3?: number | null
      lm5_tp4?: number | null
      lm5_sum?: number | null
      semester_final?: number | null
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
  const [editingGrade, setEditingGrade] = useState<string | null>(null)
  const [editingStudent, setEditingStudent] = useState<string | null>(null)

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
        toast.error('Gagal mengexport data')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Terjadi kesalahan saat export')
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
        </div>
      </div>

      {/* Tabel Input Nilai Excel */}
      <GradesTable 
        subjectId={subject.id}
        subjectName={subject.name}
        students={subject.students}
      />

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
