import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/subjects/[id]/copy-students - Salin siswa dari mata pelajaran lain
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { sourceSubjectId } = await request.json()
    const targetSubjectId = params.id

    if (!sourceSubjectId) {
      return NextResponse.json(
        { error: 'Source subject ID wajib diisi' },
        { status: 400 }
      )
    }

    // Verifikasi kedua mata pelajaran milik guru yang login
    const [sourceSubject, targetSubject] = await Promise.all([
      prisma.subject.findFirst({
        where: {
          id: sourceSubjectId,
          teacherId: session.user.id
        },
        include: {
          students: true
        }
      }),
      prisma.subject.findFirst({
        where: {
          id: targetSubjectId,
          teacherId: session.user.id
        }
      })
    ])

    if (!sourceSubject || !targetSubject) {
      return NextResponse.json(
        { error: 'Mata pelajaran tidak ditemukan' },
        { status: 404 }
      )
    }

    // Dapatkan daftar siswa yang sudah ada di target
    const existingStudents = await prisma.student.findMany({
      where: {
        subjectId: targetSubjectId
      },
      select: {
        name: true
      }
    })

    const existingNames = new Set(existingStudents.map(s => s.name.toLowerCase().trim()))

    // Filter siswa yang belum ada di target (berdasarkan nama)
    const studentsToAdd = sourceSubject.students.filter(
      student => !existingNames.has(student.name.toLowerCase().trim())
    )

    if (studentsToAdd.length === 0) {
      return NextResponse.json(
        { 
          message: 'Semua siswa dari mata pelajaran sumber sudah ada di mata pelajaran ini',
          addedCount: 0,
          skippedCount: sourceSubject.students.length
        }
      )
    }

    // Salin siswa ke target subject (tanpa nilai)
    const createdStudents = await Promise.all(
      studentsToAdd.map(student =>
        prisma.student.create({
          data: {
            name: student.name,
            gender: student.gender,
            className: student.className,
            notes: null, // Reset notes karena berbeda mata pelajaran
            subjectId: targetSubjectId
          }
        })
      )
    )

    // Buat grade record untuk setiap siswa baru
    await Promise.all(
      createdStudents.map(student =>
        prisma.grade.create({
          data: {
            studentId: student.id
          }
        })
      )
    )

    return NextResponse.json(
      { 
        message: `Berhasil menambahkan ${createdStudents.length} siswa`,
        addedCount: createdStudents.length,
        skippedCount: sourceSubject.students.length - studentsToAdd.length,
        students: createdStudents
      }
    )

  } catch (error) {
    console.error('Copy students error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyalin siswa' },
      { status: 500 }
    )
  }
}
