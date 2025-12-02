import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import GradesTable from '@/components/grades/grades-table'

interface Props {
  params: {
    id: string
  }
}

export default async function GradesPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  // Ambil data mata pelajaran dengan siswa dan nilai
  const subject = await prisma.subject.findFirst({
    where: {
      id: params.id,
      teacherId: session.user.id
    },
    include: {
      students: {
        include: {
          grades: true
        },
        orderBy: {
          name: 'asc'
        }
      }
    }
  })

  if (!subject) {
    notFound()
  }

  // Pastikan setiap siswa punya grade record
  for (const student of subject.students) {
    if (student.grades.length === 0) {
      await prisma.grade.create({
        data: {
          studentId: student.id
        }
      })
    }
  }

  // Fetch ulang data setelah membuat grade records
  const updatedSubject = await prisma.subject.findFirst({
    where: {
      id: params.id,
      teacherId: session.user.id
    },
    include: {
      students: {
        include: {
          grades: true
        },
        orderBy: {
          name: 'asc'
        }
      }
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1400px] mx-auto">
        <GradesTable
          subjectId={updatedSubject!.id}
          subjectName={updatedSubject!.name}
          students={updatedSubject!.students}
        />
      </div>
    </div>
  )
}