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

    const { name, semester } = await request.json()

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nama mata pelajaran wajib diisi' },
        { status: 400 }
      )
    }

    // Cek apakah mata pelajaran sudah ada untuk guru ini
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: name.trim(),
        teacherId: session.user.id
      }
    })

    if (existingSubject) {
      return NextResponse.json(
        { error: 'Mata pelajaran sudah ada' },
        { status: 400 }
      )
    }

    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        semester: semester?.trim() || null,
        teacherId: session.user.id,
      },
    })

    return NextResponse.json(subject, { status: 201 })
  } catch (error) {
    console.error('Subject creation error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const subjects = await prisma.subject.findMany({
      where: { teacherId: session.user.id },
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error('Subjects fetch error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}