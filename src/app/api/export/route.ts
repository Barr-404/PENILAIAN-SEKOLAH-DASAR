import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

export async function GET(request: Request) {
  try {
    console.log('[Export] Starting export request...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('[Export] Unauthorized - No session')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    console.log('[Export] Subject ID:', subjectId)

    // Buat workbook Excel
    const workbook = new ExcelJS.Workbook()

    if (subjectId) {
      // Export single subject
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
        console.log('[Export] Subject not found')
        return NextResponse.json(
          { error: 'Mata pelajaran tidak ditemukan' },
          { status: 404 }
        )
      }

      console.log('[Export] Found subject:', subject.name, 'with', subject.students.length, 'students')
      
      // Tambahkan worksheet untuk subject ini
      addSubjectWorksheet(workbook, subject)

      const fileName = `Nilai_${subject.name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`
      
      const buffer = await workbook.xlsx.writeBuffer()
      console.log('[Export] Buffer generated, size:', buffer.byteLength, 'bytes')

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      })
    } else {
      // Export all subjects, grouped by semester
      const subjects = await prisma.subject.findMany({
        where: {
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
        },
        orderBy: [
          { semester: 'asc' },
          { name: 'asc' }
        ]
      })

      if (subjects.length === 0) {
        return NextResponse.json(
          { error: 'Tidak ada mata pelajaran untuk diekspor' },
          { status: 404 }
        )
      }

      console.log('[Export] Found', subjects.length, 'subjects')

      // Group by semester
      const ganjilSubjects = subjects.filter(s => s.semester === 'Ganjil')
      const genapSubjects = subjects.filter(s => s.semester === 'Genap')
      const noSemesterSubjects = subjects.filter(s => !s.semester)

      // Add worksheets for each subject
      if (ganjilSubjects.length > 0) {
        ganjilSubjects.forEach(subject => {
          addSubjectWorksheet(workbook, subject, 'Semester Ganjil')
        })
      }

      if (genapSubjects.length > 0) {
        genapSubjects.forEach(subject => {
          addSubjectWorksheet(workbook, subject, 'Semester Genap')
        })
      }

      if (noSemesterSubjects.length > 0) {
        noSemesterSubjects.forEach(subject => {
          addSubjectWorksheet(workbook, subject)
        })
      }

      const teacherName = subjects[0]?.teacher.name || 'Guru'
      const fileName = `Nilai_Semua_Mapel_${teacherName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`
      
      const buffer = await workbook.xlsx.writeBuffer()
      console.log('[Export] Buffer generated, size:', buffer.byteLength, 'bytes')

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      })
    }

  } catch (error) {
    console.error('[Export] Excel export error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat file Excel', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function addSubjectWorksheet(workbook: ExcelJS.Workbook, subject: any, semesterLabel?: string) {
  // Create sheet name (Excel limits sheet names to 31 characters)
  let sheetName = subject.name
  if (semesterLabel) {
    sheetName = `${sheetName}`
  }
  
  // Truncate if too long
  if (sheetName.length > 31) {
    sheetName = sheetName.substring(0, 28) + '...'
  }
  
  const worksheet = workbook.addWorksheet(sheetName)

  // Informasi mata pelajaran di atas
  worksheet.mergeCells('A1:M1')
  const semesterText = subject.semester === 'Ganjil' ? 'SEMESTER GANJIL' : subject.semester === 'Genap' ? 'SEMESTER GENAP' : 'SEMESTER 1'
  worksheet.getCell('A1').value = `DAFTAR NILAI ${semesterText}`
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.getCell('A1').font = { bold: true, size: 14 }

  worksheet.mergeCells('A2:M2')
  worksheet.getCell('A2').value = `MATA PELAJARAN: ${subject.name.toUpperCase()}`
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.getCell('A2').font = { bold: true, size: 12 }

  const headerRow = 3

  // Header tabel
  const headers = ['NO', 'NAMA', 'L/P', 'LM1', 'LM2', 'LM3', 'LM4', 'LM5', 'LM6', 'SAS', 'NR', 'KET']
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(headerRow, index + 1)
    cell.value = header
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
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  })

  // Set column widths
  worksheet.getColumn(1).width = 5   // NO
  worksheet.getColumn(2).width = 25  // NAMA
  worksheet.getColumn(3).width = 8   // L/P
  worksheet.getColumn(4).width = 10  // LM1
  worksheet.getColumn(5).width = 10  // LM2
  worksheet.getColumn(6).width = 10  // LM3
  worksheet.getColumn(7).width = 10  // LM4
  worksheet.getColumn(8).width = 10  // LM5
  worksheet.getColumn(9).width = 10  // LM6
  worksheet.getColumn(10).width = 10 // SAS
  worksheet.getColumn(11).width = 10 // NR
  worksheet.getColumn(12).width = 15 // KET

  // Data siswa
  subject.students.forEach((student: any, index: number) => {
    const grade = student.grades[0]
    const row = headerRow + index + 1

    worksheet.getCell(row, 1).value = index + 1
    worksheet.getCell(row, 2).value = student.name
    worksheet.getCell(row, 3).value = student.gender || '-'
    worksheet.getCell(row, 4).value = grade?.lm1_sum || '-'
    worksheet.getCell(row, 5).value = grade?.lm2_sum || '-'
    worksheet.getCell(row, 6).value = grade?.lm3_sum || '-'
    worksheet.getCell(row, 7).value = grade?.lm4_sum || '-'
    worksheet.getCell(row, 8).value = grade?.lm5_sum || '-'
    worksheet.getCell(row, 9).value = grade?.lm6_sum || '-'
    worksheet.getCell(row, 10).value = grade?.semester_final || '-'
    worksheet.getCell(row, 11).value = grade?.final_score || '-'
    worksheet.getCell(row, 12).value = student.notes || '-'

    // Style data rows
    for (let col = 1; col <= 12; col++) {
      const cell = worksheet.getCell(row, col)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      cell.alignment = { 
        horizontal: col === 2 || col === 12 ? 'left' : 'center', 
        vertical: 'middle' 
      }
    }
  })
}