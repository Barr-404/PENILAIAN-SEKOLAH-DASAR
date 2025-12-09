import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SubjectEditForm from '@/components/subjects/subject-edit-form'

export default async function EditSubjectPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Ambil data mata pelajaran
  const subject = await prisma.subject.findFirst({
    where: {
      id: params.id,
      teacherId: session.user.id
    }
  })

  if (!subject) {
    redirect('/dashboard/subjects')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Mata Pelajaran</h1>
        <p className="text-gray-600 mt-2">
          Perbarui informasi mata pelajaran
        </p>
      </div>

      <SubjectEditForm subject={subject} />
    </div>
  )
}
