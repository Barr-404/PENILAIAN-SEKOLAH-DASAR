import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SubjectsList from '@/components/subjects/subjects-list'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function SubjectsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const subjects = await prisma.subject.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: {
        select: { students: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mata Pelajaran</h1>
          <p className="text-gray-600 mt-2">
            Kelola mata pelajaran yang Anda ajar
          </p>
        </div>
        <Link href="/dashboard/subjects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Mata Pelajaran
          </Button>
        </Link>
      </div>

      <SubjectsList subjects={subjects} />
    </div>
  )
}