import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ambil data user dengan statistik
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        nip: true,
        fase: true,
        createdAt: true,
        updatedAt: true,
        subjects: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                students: true
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Hitung statistik mengajar
    const totalSubjects = user.subjects.length
    
    // Hitung siswa UNIK berdasarkan nama (karena siswa yang sama bisa ada di beberapa mata pelajaran)
    const uniqueStudents = await prisma.$queryRaw<[{count: bigint}]>`
      SELECT COUNT(DISTINCT s.name) as count
      FROM "Student" s
      INNER JOIN "Subject" sub ON s."subjectId" = sub.id
      WHERE sub."teacherId" = ${session.user.id}
    `
    const totalStudents = Number(uniqueStudents[0].count)
    
    // Hitung total ENTRI siswa (termasuk duplikasi di berbagai mata pelajaran)
    const totalStudentEntries = user.subjects.reduce((sum, subject) => sum + subject._count.students, 0)
    
    // Hitung total nilai yang sudah diinput dengan query yang lebih efisien
    const gradesCount = await prisma.$queryRaw<[{count: bigint}]>`
      SELECT COUNT(*) as count
      FROM "Grade" g
      INNER JOIN "Student" s ON g."studentId" = s.id
      INNER JOIN "Subject" sub ON s."subjectId" = sub.id
      WHERE sub."teacherId" = ${session.user.id}
    `
    const totalGrades = Number(gradesCount[0].count)

    // Ambil aktivitas terakhir
    const lastSubjectUpdate = user.subjects.length > 0 
      ? user.subjects.reduce((latest, subject) => 
          subject.updatedAt > latest ? subject.updatedAt : latest
        , user.subjects[0].updatedAt)
      : null

    // Query untuk last grade update yang lebih efisien
    const lastGradeResult = await prisma.$queryRaw<[{updatedAt: Date}]>`
      SELECT g."updatedAt"
      FROM "Grade" g
      INNER JOIN "Student" s ON g."studentId" = s.id
      INNER JOIN "Subject" sub ON s."subjectId" = sub.id
      WHERE sub."teacherId" = ${session.user.id}
      ORDER BY g."updatedAt" DESC
      LIMIT 1
    `
    const lastGradeUpdate = lastGradeResult[0]?.updatedAt || null

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        nip: user.nip,
        fase: user.fase,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      statistics: {
        totalSubjects,
        totalStudents, // Siswa unik
        totalGrades,
        averageStudentsPerSubject: totalSubjects > 0 ? Math.round(totalStudentEntries / totalSubjects) : 0
      },
      subjects: user.subjects,
      lastActivity: {
        lastLogin: user.updatedAt,
        lastSubjectUpdate,
        lastGradeUpdate: lastGradeUpdate
      }
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, nip, fase, image } = await request.json()

    // Validasi input
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Nama wajib diisi' },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        nip: nip?.trim() || null,
        fase: fase || null,
        image: image || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        nip: true,
        fase: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
