import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ambil semua data subjects dengan students dan grades
    const subjects = await prisma.subject.findMany({
      where: { teacherId: session.user.id },
      include: {
        students: {
          include: {
            grades: {
              take: 1,
              orderBy: { updatedAt: 'desc' }
            }
          },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    if (subjects.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data untuk diekspor' },
        { status: 404 }
      )
    }

    // Buat workbook baru
    const workbook = new ExcelJS.Workbook()
    workbook.creator = session.user.name || 'Guru'
    workbook.created = new Date()

    // Sheet 1: Ringkasan
    const summarySheet = workbook.addWorksheet('Ringkasan')
    
    // Header ringkasan
    summarySheet.mergeCells('A1:D1')
    const titleCell = summarySheet.getCell('A1')
    titleCell.value = 'LAPORAN LENGKAP PENILAIAN'
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }
    }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    summarySheet.getRow(1).height = 30

    // Info guru
    summarySheet.getCell('A3').value = 'Guru:'
    summarySheet.getCell('B3').value = session.user.name || '-'
    summarySheet.getCell('A4').value = 'Tanggal Export:'
    summarySheet.getCell('B4').value = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    // Statistik
    const totalStudents = subjects.reduce((sum, s) => sum + s.students.length, 0)
    const uniqueStudents = new Set(subjects.flatMap(s => s.students.map(st => st.name))).size
    
    summarySheet.getCell('A6').value = 'STATISTIK'
    summarySheet.getCell('A6').font = { bold: true, size: 12 }
    
    const stats = [
      ['Total Mata Pelajaran', subjects.length],
      ['Total Siswa (Unik)', uniqueStudents],
      ['Total Entri Siswa', totalStudents],
    ]
    
    let row = 7
    stats.forEach(([label, value]) => {
      summarySheet.getCell(`A${row}`).value = label
      summarySheet.getCell(`B${row}`).value = value
      summarySheet.getCell(`B${row}`).font = { bold: true }
      row++
    })

    // Daftar mata pelajaran
    summarySheet.getCell('A11').value = 'DAFTAR MATA PELAJARAN'
    summarySheet.getCell('A11').font = { bold: true, size: 12 }
    
    const headerRow = summarySheet.getRow(12)
    headerRow.values = ['No', 'Mata Pelajaran', 'Semester', 'Jumlah Siswa', 'Rata-rata Nilai']
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    }

    subjects.forEach((subject, index) => {
      const validScores = subject.students
        .map(s => s.grades[0]?.final_score)
        .filter((score): score is number => score !== null && score !== undefined)
      
      const avgScore = validScores.length > 0
        ? (validScores.reduce((sum, s) => sum + s, 0) / validScores.length).toFixed(1)
        : '-'

      const dataRow = summarySheet.getRow(13 + index)
      dataRow.values = [
        index + 1,
        subject.name,
        subject.semester || '-',
        subject.students.length,
        avgScore
      ]
    })

    // Auto width
    summarySheet.columns = [
      { width: 5 },
      { width: 30 },
      { width: 15 },
      { width: 15 },
      { width: 15 }
    ]

    // Sheet untuk setiap mata pelajaran
    subjects.forEach((subject) => {
      const sheet = workbook.addWorksheet(subject.name.substring(0, 30))
      
      // Header
      sheet.mergeCells('A1:M1')
      const titleCell = sheet.getCell('A1')
      titleCell.value = subject.name
      titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' }
      }
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
      sheet.getRow(1).height = 25

      // Info
      sheet.getCell('A2').value = `Semester: ${subject.semester || '-'}`
      sheet.getCell('A3').value = `Jumlah Siswa: ${subject.students.length}`

      // Header tabel
      const headerRow = sheet.getRow(5)
      headerRow.values = ['No', 'Nama Siswa', 'L/P', 'LM1', 'LM2', 'LM3', 'LM4', 'LM5', 'LM6', 'SAS', 'NR', 'Keterangan']
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' }
      }
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
      headerRow.height = 20

      // Data siswa
      subject.students.forEach((student, index) => {
        const grade = student.grades[0]
        const dataRow = sheet.getRow(6 + index)
        dataRow.values = [
          index + 1,
          student.name,
          student.gender || '-',
          grade?.lm1_sum || '-',
          grade?.lm2_sum || '-',
          grade?.lm3_sum || '-',
          grade?.lm4_sum || '-',
          grade?.lm5_sum || '-',
          grade?.lm6_sum || '-',
          grade?.semester_final || '-',
          grade?.final_score ? grade.final_score.toFixed(2) : '-',
          student.notes || '-'
        ]
        
        // Alternate row colors
        if (index % 2 === 0) {
          dataRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' }
          }
        }
      })

      // Border untuk semua cell
      const lastRow = 5 + subject.students.length
      for (let i = 5; i <= lastRow; i++) {
        for (let j = 1; j <= 12; j++) {
          const cell = sheet.getCell(i, j)
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          if (i > 5) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' }
          }
        }
      }

      // Auto width
      sheet.columns = [
        { width: 5 },
        { width: 25 },
        { width: 8 },
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 20 }
      ]
    })

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Return sebagai response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Laporan_Lengkap_${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
