import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID wajib diisi' },
        { status: 400 }
      )
    }

    // Verifikasi mata pelajaran milik guru yang login
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        teacherId: session.user.id
      },
      include: {
        teacher: true,
        students: {
          include: {
            grades: true
          },
          orderBy: { name: 'asc' }
        }
      }
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Mata pelajaran tidak ditemukan' },
        { status: 404 }
      )
    }

    // Buat workbook Excel
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Nilai Siswa')

    // Header - struktur baru dengan Lingkup Materi
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'NIS', key: 'nis', width: 12 },
      { header: 'Nama Siswa', key: 'name', width: 25 },
      { header: 'LM1 TP1', key: 'lm1_tp1', width: 10 },
      { header: 'LM1 TP2', key: 'lm1_tp2', width: 10 },
      { header: 'LM1 TP3', key: 'lm1_tp3', width: 10 },
      { header: 'LM1 TP4', key: 'lm1_tp4', width: 10 },
      { header: 'LM2 TP1', key: 'lm2_tp1', width: 10 },
      { header: 'LM2 TP2', key: 'lm2_tp2', width: 10 },
      { header: 'LM2 TP3', key: 'lm2_tp3', width: 10 },
      { header: 'LM2 TP4', key: 'lm2_tp4', width: 10 },
      { header: 'LM3 TP1', key: 'lm3_tp1', width: 10 },
      { header: 'LM3 TP2', key: 'lm3_tp2', width: 10 },
      { header: 'LM3 TP3', key: 'lm3_tp3', width: 10 },
      { header: 'LM3 TP4', key: 'lm3_tp4', width: 10 },
      { header: 'LM4 TP1', key: 'lm4_tp1', width: 10 },
      { header: 'LM4 TP2', key: 'lm4_tp2', width: 10 },
      { header: 'LM4 TP3', key: 'lm4_tp3', width: 10 },
      { header: 'LM4 TP4', key: 'lm4_tp4', width: 10 },
      { header: 'LM5 TP1', key: 'lm5_tp1', width: 10 },
      { header: 'LM5 TP2', key: 'lm5_tp2', width: 10 },
      { header: 'LM5 TP3', key: 'lm5_tp3', width: 10 },
      { header: 'LM5 TP4', key: 'lm5_tp4', width: 10 },
      { header: 'LM1 Sum', key: 'lm1_sum', width: 12 },
      { header: 'LM2 Sum', key: 'lm2_sum', width: 12 },
      { header: 'LM3 Sum', key: 'lm3_sum', width: 12 },
      { header: 'LM4 Sum', key: 'lm4_sum', width: 12 },
      { header: 'LM5 Sum', key: 'lm5_sum', width: 12 },
      { header: 'Semester Final', key: 'semester_final', width: 15 },
    ]

    // Style header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' }
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    // Data siswa dengan struktur baru
    subject.students.forEach((student, index) => {
      const grade = student.grades[0] // Ambil grade pertama
      
      worksheet.addRow({
        no: index + 1,
        nis: student.nis || '-',
        name: student.name,
        lm1_tp1: grade?.lm1_tp1 || '-',
        lm1_tp2: grade?.lm1_tp2 || '-',
        lm1_tp3: grade?.lm1_tp3 || '-',
        lm1_tp4: grade?.lm1_tp4 || '-',
        lm2_tp1: grade?.lm2_tp1 || '-',
        lm2_tp2: grade?.lm2_tp2 || '-',
        lm2_tp3: grade?.lm2_tp3 || '-',
        lm2_tp4: grade?.lm2_tp4 || '-',
        lm3_tp1: grade?.lm3_tp1 || '-',
        lm3_tp2: grade?.lm3_tp2 || '-',
        lm3_tp3: grade?.lm3_tp3 || '-',
        lm3_tp4: grade?.lm3_tp4 || '-',
        lm4_tp1: grade?.lm4_tp1 || '-',
        lm4_tp2: grade?.lm4_tp2 || '-',
        lm4_tp3: grade?.lm4_tp3 || '-',
        lm4_tp4: grade?.lm4_tp4 || '-',
        lm5_tp1: grade?.lm5_tp1 || '-',
        lm5_tp2: grade?.lm5_tp2 || '-',
        lm5_tp3: grade?.lm5_tp3 || '-',
        lm5_tp4: grade?.lm5_tp4 || '-',
        lm1_sum: grade?.lm1_sum || '-',
        lm2_sum: grade?.lm2_sum || '-',
        lm3_sum: grade?.lm3_sum || '-',
        lm4_sum: grade?.lm4_sum || '-',
        lm5_sum: grade?.lm5_sum || '-',
        semester_final: grade?.semester_final || '-'
      })
    })

    // Style data rows
    for (let i = 2; i <= subject.students.length + 1; i++) {
      worksheet.getRow(i).eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    }

    // Informasi mata pelajaran
    worksheet.insertRow(1, ['Mata Pelajaran:', subject.name])
    worksheet.insertRow(2, ['Guru:', subject.teacher.name])
    worksheet.insertRow(3, ['Tanggal Export:', new Date().toLocaleDateString('id-ID')])
    worksheet.insertRow(4, []) // Baris kosong

    // Style info rows
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(2).font = { bold: true }
    worksheet.getRow(3).font = { bold: true }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Nama file
    const fileName = `Nilai_${subject.name.replace(/[^a-zA-Z0-9]/g, '_')}_${subject.teacher.name?.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })

  } catch (error) {
    console.error('Excel export error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat file Excel' },
      { status: 500 }
    )
  }
}