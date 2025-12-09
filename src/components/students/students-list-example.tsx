'use client'

import { useState } from 'react'
import StudentFilters, { StudentData } from '@/components/students/student-filters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Contoh data siswa
const SAMPLE_STUDENTS: StudentData[] = [
  {
    id: '1',
    name: 'Ahmad Fauzi',
    nis: '2001',
    className: '4A',
    subjectId: 'mtk-001',
    subjectName: 'Matematika',
    finalScore: 92,
    averageGrade: 92,
    ranking: 1
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    nis: '2002',
    className: '4A',
    subjectId: 'ipa-001',
    subjectName: 'IPA',
    finalScore: 88,
    averageGrade: 88,
    ranking: 3
  },
  {
    id: '3',
    name: 'Budi Santoso',
    nis: '2003',
    className: '4B',
    subjectId: 'mtk-001',
    subjectName: 'Matematika',
    finalScore: 75,
    averageGrade: 75,
    ranking: 8
  },
  {
    id: '4',
    name: 'Dewi Kartika',
    nis: '2004',
    className: '4A',
    subjectId: 'ipa-001',
    subjectName: 'IPA',
    finalScore: 95,
    averageGrade: 95,
    ranking: 1
  },
  {
    id: '5',
    name: 'Eko Prasetyo',
    nis: '2005',
    className: '4B',
    subjectId: 'mtk-001',
    subjectName: 'Matematika',
    finalScore: 82,
    averageGrade: 82,
    ranking: 5
  },
  {
    id: '6',
    name: 'Fitri Rahmawati',
    nis: '2006',
    className: '4C',
    subjectId: 'ips-001',
    subjectName: 'IPS',
    finalScore: 90,
    averageGrade: 90,
    ranking: 2
  },
  {
    id: '7',
    name: 'Gilang Ramadhan',
    nis: '2007',
    className: '4C',
    subjectId: 'ipa-001',
    subjectName: 'IPA',
    finalScore: 68,
    averageGrade: 68,
    ranking: 12
  },
  {
    id: '8',
    name: 'Hani Safitri',
    nis: '2008',
    className: '4A',
    subjectId: 'mtk-001',
    subjectName: 'Matematika',
    finalScore: 98,
    averageGrade: 98,
    ranking: 1
  }
]

// Available classes
const AVAILABLE_CLASSES = ['4A', '4B', '4C', '5A', '5B', '6A']

// Available subjects
const AVAILABLE_SUBJECTS = [
  { id: 'mtk-001', name: 'Matematika' },
  { id: 'ipa-001', name: 'IPA' },
  { id: 'ips-001', name: 'IPS' },
  { id: 'bindo-001', name: 'Bahasa Indonesia' },
  { id: 'bing-001', name: 'Bahasa Inggris' }
]

export default function StudentsListExample() {
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>(SAMPLE_STUDENTS)

  const handleFilterChange = (filtered: StudentData[]) => {
    setFilteredStudents(filtered)
  }

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-300'
    if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-300'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Daftar Siswa</h1>
        <p className="text-gray-600 mt-2">
          Kelola dan lihat data siswa dengan filter dan sorting
        </p>
      </div>

      {/* Filter Component */}
      <StudentFilters
        students={SAMPLE_STUDENTS}
        onFilterChange={handleFilterChange}
        availableClasses={AVAILABLE_CLASSES}
        availableSubjects={AVAILABLE_SUBJECTS}
      />

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Menampilkan <strong>{filteredStudents.length}</strong> dari <strong>{SAMPLE_STUDENTS.length}</strong> siswa
        </p>
      </div>

      {/* Students List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Tidak ada siswa yang sesuai dengan filter</p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">NIS: {student.nis}</p>
                  </div>
                  {student.ranking && student.ranking <= 3 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Rank #{student.ranking}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Kelas:</span>
                  <Badge variant="outline">{student.className}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mapel:</span>
                  <span className="text-sm font-medium">{student.subjectName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nilai Akhir:</span>
                  <Badge className={getGradeColor(student.finalScore || 0)}>
                    {student.finalScore?.toFixed(1) || '-'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
