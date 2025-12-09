'use client'

import { useState } from 'react'
import StudentFilters, { StudentData } from '@/components/students/student-filters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Trophy, TrendingUp } from 'lucide-react'

interface StudentsPageProps {
  initialStudents: StudentData[]
  availableClasses: string[]
  availableSubjects: Array<{ id: string; name: string }>
}

export default function StudentsPage({ 
  initialStudents, 
  availableClasses, 
  availableSubjects 
}: StudentsPageProps) {
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>(initialStudents)

  const handleFilterChange = (filtered: StudentData[]) => {
    setFilteredStudents(filtered)
  }

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-300'
    if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-300'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  const getGradeLabel = (score: number) => {
    if (score >= 90) return 'Sangat Baik'
    if (score >= 75) return 'Baik'
    if (score >= 60) return 'Cukup'
    return 'Perlu Bimbingan'
  }

  // Statistics
  const totalStudents = initialStudents.length
  const averageScore = initialStudents.length > 0
    ? initialStudents.reduce((sum, s) => sum + (s.finalScore || 0), 0) / initialStudents.length
    : 0
  const topStudents = initialStudents.filter(s => (s.finalScore || 0) >= 90).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          Data Siswa
        </h1>
        <p className="text-gray-600 mt-2">
          Kelola dan lihat data siswa dengan filter dan sorting
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Siswa</p>
                <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
              </div>
              <Users className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rata-rata Nilai</p>
                <p className="text-3xl font-bold text-green-600">{averageScore.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Siswa Berprestasi</p>
                <p className="text-3xl font-bold text-yellow-600">{topStudents}</p>
                <p className="text-xs text-gray-500 mt-1">Nilai ≥ 90</p>
              </div>
              <Trophy className="h-10 w-10 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Component */}
      <StudentFilters
        students={initialStudents}
        onFilterChange={handleFilterChange}
        availableClasses={availableClasses}
        availableSubjects={availableSubjects}
      />

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Menampilkan <strong>{filteredStudents.length}</strong> dari <strong>{totalStudents}</strong> siswa
        </p>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStudents.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Tidak ada siswa yang sesuai dengan filter</p>
              <p className="text-gray-400 text-sm mt-2">Coba ubah kriteria pencarian atau reset filter</p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate" title={student.name}>
                      {student.name}
                    </CardTitle>
                    {student.nis && (
                      <p className="text-sm text-gray-500 mt-1">NIS: {student.nis}</p>
                    )}
                  </div>
                  {student.ranking && student.ranking <= 3 && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 shrink-0">
                      #{student.ranking}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Nilai Akhir:</span>
                    <Badge className={getGradeColor(student.finalScore || 0)}>
                      {student.finalScore?.toFixed(1) || '0.0'}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (student.finalScore || 0) >= 90 ? 'bg-green-500' :
                        (student.finalScore || 0) >= 75 ? 'bg-blue-500' :
                        (student.finalScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((student.finalScore || 0), 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-1">
                    {getGradeLabel(student.finalScore || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
