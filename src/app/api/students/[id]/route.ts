import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, nis, className } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Nama siswa wajib diisi' },
        { status: 400 }
      )
    }

    // Verifikasi bahwa siswa milik guru yang login
    const student = await prisma.student.findFirst({
      where: {
        id: params.id,
        subject: {
          teacherId: session.user.id
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cek duplikasi NIS jika diisi
    if (nis?.trim()) {
      const existingStudent = await prisma.student.findFirst({
        where: {
          nis: nis.trim(),
          subjectId: student.subjectId,
          id: { not: params.id } // Exclude siswa yang sedang di-edit
        }
      })

      if (existingStudent) {
        return NextResponse.json(
          { error: 'NIS sudah digunakan siswa lain di mata pelajaran ini' },
          { status: 400 }
        )
      }
    }

    // Update data siswa
    const updatedStudent = await prisma.student.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        nis: nis?.trim() || null,
        className: className?.trim() || null
      }
    })

    return NextResponse.json({
      message: 'Data siswa berhasil diperbarui',
      student: updatedStudent
    })

  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}