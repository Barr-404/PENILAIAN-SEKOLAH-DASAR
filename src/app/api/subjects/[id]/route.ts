import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'

export async function DELETE(
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

    const subjectId = params.id

    // Cek apakah mata pelajaran milik guru ini
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

    // Hapus semua data terkait secara berurutan
    // 1. Hapus grades dari semua siswa di mata pelajaran ini
    await prisma.grade.deleteMany({
      where: {
        student: {
          subjectId: subjectId
        }
      }
    })

    // 2. Hapus siswa dari mata pelajaran ini
    await prisma.student.deleteMany({
      where: {
        subjectId: subjectId
      }
    })

    // 3. Hapus mata pelajaran
    await prisma.subject.delete({
      where: {
        id: subjectId
      }
    })

    return NextResponse.json({ 
      message: 'Mata pelajaran berhasil dihapus' 
    }, { status: 200 })

  } catch (error) {
    console.error('Subject deletion error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus mata pelajaran' },
      { status: 500 }
    )
  }
}

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

    const subjectId = params.id
    const { name } = await request.json()

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nama mata pelajaran wajib diisi' },
        { status: 400 }
      )
    }

    // Cek apakah mata pelajaran milik guru ini
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

    // Cek apakah nama sudah ada (kecuali untuk mata pelajaran ini sendiri)
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: name.trim(),
        teacherId: session.user.id,
        id: {
          not: subjectId
        }
      }
    })

    if (existingSubject) {
      return NextResponse.json(
        { error: 'Nama mata pelajaran sudah ada' },
        { status: 400 }
      )
    }

    // Update mata pelajaran
    const updatedSubject = await prisma.subject.update({
      where: {
        id: subjectId
      },
      data: {
        name: name.trim()
      }
    })

    return NextResponse.json(updatedSubject, { status: 200 })

  } catch (error) {
    console.error('Subject update error:', error)
    return NextResponse.json(
      { error: 'Gagal mengubah mata pelajaran' },
      { status: 500 }
    )
  }
}