import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SubjectsList from '@/components/subjects/subjects-list'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import ExportAllButton from '../../../components/subjects/export-all-button'

export const revalidate = 30 // Revalidate setiap 30 detik

export default async function SubjectsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const subjects = await prisma.subject.findMany({
    where: { teacherId: session.user.id },
    select: {
      id: true,
      name: true,
      semester: true,
      _count: {
        select: { students: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Calculate statistics
  const semesterCounts = subjects.reduce((acc, subject) => {
    if (subject.semester === 'Ganjil') acc.ganjil++
    else if (subject.semester === 'Genap') acc.genap++
    return acc
  }, { ganjil: 0, genap: 0 })

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl md:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 text-white">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2 md:gap-3">
              📚 <span>Mata Pelajaran</span>
            </h1>
            <p className="text-blue-100 text-sm sm:text-base md:text-lg">
              Kelola mata pelajaran yang Anda ajar
            </p>
          </div>

          {/* Statistics */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap">
            <div className="flex items-center gap-2 bg-blue-500/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
              <span className="font-semibold">{subjects.length}</span>
              <span className="hidden xs:inline">Mata Pelajaran</span>
              <span className="xs:hidden">Mapel</span>
            </div>
            {semesterCounts.ganjil > 0 && (
              <div className="flex items-center gap-2 bg-emerald-500/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
                <span className="font-semibold">{semesterCounts.ganjil}</span>
                <span className="hidden sm:inline">Semester Ganjil</span>
                <span className="sm:hidden">Ganjil</span>
              </div>
            )}
            {semesterCounts.genap > 0 && (
              <div className="flex items-center gap-2 bg-purple-500/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
                <span className="font-semibold">{semesterCounts.genap}</span>
                <span className="hidden sm:inline">Semester Genap</span>
                <span className="sm:hidden">Genap</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            {subjects.length > 0 && (
              <div className="w-full sm:w-auto">
                <ExportAllButton />
              </div>
            )}
            <Link href="/dashboard/subjects/new" className="w-full sm:w-auto">
              <Button 
                size="lg"
                className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 h-11 sm:h-12 px-4 sm:px-6"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">Tambah Mata Pelajaran</span>
                <span className="sm:hidden">Tambah Mapel</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Subjects List */}
      {subjects.length > 0 ? (
        <SubjectsList subjects={subjects} />
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300">
          <div className="max-w-md mx-auto">
            <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">📚</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Belum ada mata pelajaran
            </h3>
            <p className="text-gray-600 mb-6">
              Mulai dengan menambahkan mata pelajaran pertama Anda untuk mengelola siswa dan nilai.
            </p>
            <Link href="/dashboard/subjects/new">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-5 w-5 mr-2" />
                Tambah Mata Pelajaran Pertama
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}