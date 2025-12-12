import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import SubjectDetailPage from '@/components/subjects/subject-detail-page'

interface Props {
  params: {
    id: string
  }
}

export default async function SubjectPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  // Ambil data mata pelajaran dengan siswa dan nilai (optimized)
  const subject = await prisma.subject.findFirst({
    where: {
      id: params.id,
      teacherId: session.user.id
    },
    select: {
      id: true,
      name: true,
      semester: true,
      students: {
        select: {
          id: true,
          name: true,
          nis: true,
          gender: true,
          notes: true,
          className: true,
          grades: true
        },
        orderBy: {
          name: 'asc'
        }
      },
      teacher: {
        select: {
          name: true,
          email: true
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

  // Fetch ulang data setelah membuat grade records (optimized)
  const updatedSubject = await prisma.subject.findFirst({
    where: {
      id: params.id,
      teacherId: session.user.id
    },
    select: {
      id: true,
      name: true,
      semester: true,
      students: {
        select: {
          id: true,
          name: true,
          nis: true,
          gender: true,
          notes: true,
          className: true,
          grades: true
        },
        orderBy: {
          name: 'asc'
        }
      },
      teacher: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  return <SubjectDetailPage subject={updatedSubject!} />
}