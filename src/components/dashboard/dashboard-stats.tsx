import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface DashboardStatsProps {
  subjectCount: number
  studentCount: number
  recentSubjects: Array<{
    id: string
    name: string
    _count: { students: number }
  }>
}

export default function DashboardStats({ 
  subjectCount, 
  studentCount, 
  recentSubjects 
}: DashboardStatsProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Mata Pelajaran
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjectCount}</div>
            <p className="text-xs text-muted-foreground">
              Mata pelajaran yang Anda ajar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Siswa
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
            <p className="text-xs text-muted-foreground">
              Siswa di semua mata pelajaran
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Siswa
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subjectCount > 0 ? Math.round(studentCount / subjectCount) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Siswa per mata pelajaran
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>Mata Pelajaran Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSubjects.length > 0 ? (
            <div className="space-y-4">
              {recentSubjects.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{subject.name}</p>
                    <p className="text-sm text-gray-500">
                      {subject._count.students} siswa
                    </p>
                  </div>
                  <Link 
                    href={`/dashboard/subjects/${subject.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Lihat Detail
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Belum ada mata pelajaran
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Mulai dengan menambahkan mata pelajaran pertama Anda.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/subjects/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <BookOpen className="-ml-1 mr-2 h-5 w-5" />
                  Tambah Mata Pelajaran
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}