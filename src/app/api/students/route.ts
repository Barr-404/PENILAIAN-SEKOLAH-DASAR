import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, gender, notes, className, subjectId } = await request.json()

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Mata pelajaran wajib diisi' },
        { status: 400 }
      )
    }

    // Verifikasi bahwa mata pelajaran milik guru yang login
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        teacherId: session.user.id
      }
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Mata pelajaran tidak ditemukan' },
        { status: 404 }
      )
    }

    // Create student dengan Grade record sekaligus
    const student = await prisma.student.create({
      data: {
        name: name?.trim() || 'Siswa Baru', // Default name jika kosong
        gender: gender?.trim() || null,
        notes: notes?.trim() || null,
        className: className?.trim() || null,
        subjectId,
        grades: {
          create: {} // Create empty grade record untuk enable inline editing
        }
      },
      include: {
        grades: true,
        subject: true
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Student creation error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}