import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SubjectsList from '@/components/subjects/subjects-list'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import ExportAllButton from '../../../components/subjects/export-all-button'

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              📚 Mata Pelajaran
            </h1>
            <p className="text-blue-100 text-lg">
              Kelola mata pelajaran yang Anda ajar
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2 bg-blue-500/30 px-4 py-2 rounded-lg">
                <span className="font-semibold">{subjects.length}</span>
                <span>Mata Pelajaran</span>
              </div>
              {semesterCounts.ganjil > 0 && (
                <div className="flex items-center gap-2 bg-emerald-500/30 px-4 py-2 rounded-lg">
                  <span className="font-semibold">{semesterCounts.ganjil}</span>
                  <span>Semester Ganjil</span>
                </div>
              )}
              {semesterCounts.genap > 0 && (
                <div className="flex items-center gap-2 bg-purple-500/30 px-4 py-2 rounded-lg">
                  <span className="font-semibold">{semesterCounts.genap}</span>
                  <span>Semester Genap</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {subjects.length > 0 && <ExportAllButton />}
            <Link href="/dashboard/subjects/new">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6"
              >
                <Plus className="h-5 w-5 mr-2" />
                Tambah Mata Pelajaran
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