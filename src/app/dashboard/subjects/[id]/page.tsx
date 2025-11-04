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

  return <SubjectDetailPage subject={subject} />
}