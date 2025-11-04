import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, nis, className, subjectId } = await request.json()

    if (!name || !subjectId) {
      return NextResponse.json(
        { error: 'Nama siswa dan mata pelajaran wajib diisi' },
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

    // Cek duplikasi NIS dalam mata pelajaran yang sama (jika NIS diisi)
    if (nis) {
      const existingStudent = await prisma.student.findFirst({
        where: {
          nis: nis.trim(),
          subjectId
        }
      })

      if (existingStudent) {
        return NextResponse.json(
          { error: 'NIS sudah terdaftar di mata pelajaran ini' },
          { status: 400 }
        )
      }
    }

    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        nis: nis?.trim() || null,
        className: className?.trim() || null,
        subjectId
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