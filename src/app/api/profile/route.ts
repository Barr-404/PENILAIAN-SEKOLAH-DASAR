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
        kelas: true,
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
    const totalStudents = user.subjects.reduce((sum, subject) => sum + subject._count.students, 0)
    
    // Hitung total nilai yang sudah diinput
    const totalGrades = await prisma.grade.count({
      where: {
        student: {
          subject: {
            teacherId: session.user.id
          }
        }
      }
    })

    // Ambil aktivitas terakhir
    const lastSubjectUpdate = user.subjects.length > 0 
      ? user.subjects.reduce((latest, subject) => 
          subject.updatedAt > latest ? subject.updatedAt : latest
        , user.subjects[0].updatedAt)
      : null

    const lastGradeUpdate = await prisma.grade.findFirst({
      where: {
        student: {
          subject: {
            teacherId: session.user.id
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        updatedAt: true
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        nip: user.nip,
        kelas: user.kelas,
        fase: user.fase,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      statistics: {
        totalSubjects,
        totalStudents,
        totalGrades,
        averageStudentsPerSubject: totalSubjects > 0 ? Math.round(totalStudents / totalSubjects) : 0
      },
      subjects: user.subjects,
      lastActivity: {
        lastLogin: user.updatedAt,
        lastSubjectUpdate,
        lastGradeUpdate: lastGradeUpdate?.updatedAt || null
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

    const { name, nip, kelas, fase, image } = await request.json()

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
        kelas: kelas || null,
        fase: fase || null,
        image: image || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        nip: true,
        kelas: true,
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
