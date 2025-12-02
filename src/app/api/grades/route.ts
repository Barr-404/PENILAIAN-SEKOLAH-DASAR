import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
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

    const data = await request.json()
    const { studentId } = data

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

    // Siapkan data untuk create/update
    const gradeData: any = { studentId }
    
    // Lingkup Materi 1
    if (data.lm1_tp1 !== undefined) gradeData.lm1_tp1 = data.lm1_tp1 ? parseFloat(data.lm1_tp1) : null
    if (data.lm1_tp2 !== undefined) gradeData.lm1_tp2 = data.lm1_tp2 ? parseFloat(data.lm1_tp2) : null
    if (data.lm1_tp3 !== undefined) gradeData.lm1_tp3 = data.lm1_tp3 ? parseFloat(data.lm1_tp3) : null
    if (data.lm1_tp4 !== undefined) gradeData.lm1_tp4 = data.lm1_tp4 ? parseFloat(data.lm1_tp4) : null
    if (data.lm1_sum !== undefined) gradeData.lm1_sum = data.lm1_sum ? parseFloat(data.lm1_sum) : null
    
    // Lingkup Materi 2
    if (data.lm2_tp1 !== undefined) gradeData.lm2_tp1 = data.lm2_tp1 ? parseFloat(data.lm2_tp1) : null
    if (data.lm2_tp2 !== undefined) gradeData.lm2_tp2 = data.lm2_tp2 ? parseFloat(data.lm2_tp2) : null
    if (data.lm2_tp3 !== undefined) gradeData.lm2_tp3 = data.lm2_tp3 ? parseFloat(data.lm2_tp3) : null
    if (data.lm2_tp4 !== undefined) gradeData.lm2_tp4 = data.lm2_tp4 ? parseFloat(data.lm2_tp4) : null
    if (data.lm2_sum !== undefined) gradeData.lm2_sum = data.lm2_sum ? parseFloat(data.lm2_sum) : null
    
    // Lingkup Materi 3
    if (data.lm3_tp1 !== undefined) gradeData.lm3_tp1 = data.lm3_tp1 ? parseFloat(data.lm3_tp1) : null
    if (data.lm3_tp2 !== undefined) gradeData.lm3_tp2 = data.lm3_tp2 ? parseFloat(data.lm3_tp2) : null
    if (data.lm3_tp3 !== undefined) gradeData.lm3_tp3 = data.lm3_tp3 ? parseFloat(data.lm3_tp3) : null
    if (data.lm3_tp4 !== undefined) gradeData.lm3_tp4 = data.lm3_tp4 ? parseFloat(data.lm3_tp4) : null
    if (data.lm3_sum !== undefined) gradeData.lm3_sum = data.lm3_sum ? parseFloat(data.lm3_sum) : null
    
    // Lingkup Materi 4
    if (data.lm4_tp1 !== undefined) gradeData.lm4_tp1 = data.lm4_tp1 ? parseFloat(data.lm4_tp1) : null
    if (data.lm4_tp2 !== undefined) gradeData.lm4_tp2 = data.lm4_tp2 ? parseFloat(data.lm4_tp2) : null
    if (data.lm4_tp3 !== undefined) gradeData.lm4_tp3 = data.lm4_tp3 ? parseFloat(data.lm4_tp3) : null
    if (data.lm4_tp4 !== undefined) gradeData.lm4_tp4 = data.lm4_tp4 ? parseFloat(data.lm4_tp4) : null
    if (data.lm4_sum !== undefined) gradeData.lm4_sum = data.lm4_sum ? parseFloat(data.lm4_sum) : null
    
    // Lingkup Materi 5
    if (data.lm5_tp1 !== undefined) gradeData.lm5_tp1 = data.lm5_tp1 ? parseFloat(data.lm5_tp1) : null
    if (data.lm5_tp2 !== undefined) gradeData.lm5_tp2 = data.lm5_tp2 ? parseFloat(data.lm5_tp2) : null
    if (data.lm5_tp3 !== undefined) gradeData.lm5_tp3 = data.lm5_tp3 ? parseFloat(data.lm5_tp3) : null
    if (data.lm5_tp4 !== undefined) gradeData.lm5_tp4 = data.lm5_tp4 ? parseFloat(data.lm5_tp4) : null
    if (data.lm5_sum !== undefined) gradeData.lm5_sum = data.lm5_sum ? parseFloat(data.lm5_sum) : null
    
    // Semester Final
    if (data.semester_final !== undefined) gradeData.semester_final = data.semester_final ? parseFloat(data.semester_final) : null

    // Cek apakah sudah ada grade untuk siswa ini
    const existingGrade = await prisma.grade.findFirst({
      where: { studentId }
    })

    let grade
    if (existingGrade) {
      // Update grade yang sudah ada (hapus studentId dari gradeData untuk update)
      const { studentId: _, ...updateData } = gradeData
      grade = await prisma.grade.update({
        where: { id: existingGrade.id },
        data: updateData
      })
    } else {
      // Buat grade baru
      grade = await prisma.grade.create({
        data: gradeData
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