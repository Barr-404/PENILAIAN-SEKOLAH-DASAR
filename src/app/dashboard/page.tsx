import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardStats from '@/components/dashboard/dashboard-stats'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  // Ambil statistik untuk dashboard
  const subjectCount = await prisma.subject.count({
    where: { teacherId: session.user.id }
  })

  const studentCount = await prisma.student.count({
    where: {
      subject: {
        teacherId: session.user.id
      }
    }
  })

  const recentSubjects = await prisma.subject.findMany({
    where: { teacherId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    include: {
      _count: {
        select: { students: true }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Selamat Datang, {session.user.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Kelola mata pelajaran dan nilai siswa Anda di sini.
        </p>
      </div>

      <DashboardStats 
        subjectCount={subjectCount}
        studentCount={studentCount}
        recentSubjects={recentSubjects}
      />
    </div>
  )
}