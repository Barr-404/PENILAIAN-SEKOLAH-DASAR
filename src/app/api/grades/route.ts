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

    const { studentId, tugasHarian, ulanganTengahSemester, ulanganAkhirSemester } = await request.json()

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID wajib diisi' },
        { status: 400 }
      )
    }

    // Verifikasi bahwa siswa milik guru yang login
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
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

    // Hitung rata-rata jika semua nilai ada
    let average = null
    if (tugasHarian !== null && ulanganTengahSemester !== null && ulanganAkhirSemester !== null) {
      average = (parseFloat(tugasHarian) + parseFloat(ulanganTengahSemester) + parseFloat(ulanganAkhirSemester)) / 3
    }

    // Cek apakah sudah ada grade untuk siswa ini
    const existingGrade = await prisma.grade.findFirst({
      where: { studentId }
    })

    let grade
    if (existingGrade) {
      // Update grade yang sudah ada
      grade = await prisma.grade.update({
        where: { id: existingGrade.id },
        data: {
          tugasHarian: tugasHarian ? parseFloat(tugasHarian) : null,
          ulanganTengahSemester: ulanganTengahSemester ? parseFloat(ulanganTengahSemester) : null,
          ulanganAkhirSemester: ulanganAkhirSemester ? parseFloat(ulanganAkhirSemester) : null,
          average
        }
      })
    } else {
      // Buat grade baru
      grade = await prisma.grade.create({
        data: {
          studentId,
          tugasHarian: tugasHarian ? parseFloat(tugasHarian) : null,
          ulanganTengahSemester: ulanganTengahSemester ? parseFloat(ulanganTengahSemester) : null,
          ulanganAkhirSemester: ulanganAkhirSemester ? parseFloat(ulanganAkhirSemester) : null,
          average
        }
      })
    }

    return NextResponse.json(grade)
  } catch (error) {
    console.error('Grade save error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}