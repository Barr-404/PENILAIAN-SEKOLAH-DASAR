import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
        { error: 'Subject ID required' },
        { status: 400 }
      )
    }

    // Ambil data mata pelajaran dengan siswa dan nilai
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        teacherId: session.user.id
      },
      include: {
        students: {
          include: {
            grades: true
          },
          orderBy: {
            name: 'asc'
          }
        }
      }
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      )
    }

    // Buat workbook Excel
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Daftar Nilai')

    // Header utama
    worksheet.mergeCells('A1:Z1')
    worksheet.getCell('A1').value = 'DAFTAR NILAI SEMESTER 1'
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getCell('A1').font = { bold: true, size: 14 }

    worksheet.mergeCells('A2:Z2')
    worksheet.getCell('A2').value = `MATA PELAJARAN: ${subject.name.toUpperCase()}`
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getCell('A2').font = { bold: true, size: 12 }

    // Headers tabel
    let col = 1
    
    // Headers dasar
    worksheet.getCell(4, col++).value = 'No'
    worksheet.getCell(4, col++).value = 'NIS'
    worksheet.getCell(4, col++).value = 'Nama Siswa'
    
    // Headers Lingkup Materi
    const startLMCol = col
    for (let lm = 1; lm <= 5; lm++) {
      worksheet.mergeCells(4, col, 4, col + 3)
      worksheet.getCell(4, col).value = `Lingkup Materi ${lm}`
      worksheet.getCell(4, col).alignment = { horizontal: 'center' }
      
      for (let tp = 1; tp <= 4; tp++) {
        worksheet.getCell(5, col++).value = `TP${tp}`
      }
    }
    
    // Headers Sumatif
    for (let lm = 1; lm <= 5; lm++) {
      worksheet.getCell(4, col).value = `Sumatif LM${lm}`
      worksheet.getCell(5, col++).value = 'Nilai'
    }
    
    // Header Sumatif Akhir Semester
    worksheet.getCell(4, col).value = 'Sumatif Akhir Semester'
    worksheet.getCell(5, col++).value = 'Nilai'

    // Style headers
    for (let i = 1; i < col; i++) {
      worksheet.getCell(4, i).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' }
      }
      worksheet.getCell(4, i).font = { bold: true }
      worksheet.getCell(4, i).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      
      if (worksheet.getCell(5, i).value) {
        worksheet.getCell(5, i).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0F8FF' }
        }
        worksheet.getCell(5, i).font = { bold: true, size: 9 }
        worksheet.getCell(5, i).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      }
    }

    // Data siswa
    let row = 6
    subject.students.forEach((student, index) => {
      const grade = student.grades[0] || {}
      
      let dataCol = 1
      
      // Data dasar
      worksheet.getCell(row, dataCol++).value = index + 1
      worksheet.getCell(row, dataCol++).value = student.nis || '-'
      worksheet.getCell(row, dataCol++).value = student.name
      
      // Data Lingkup Materi TP1-TP4
      for (let lm = 1; lm <= 5; lm++) {
        for (let tp = 1; tp <= 4; tp++) {
          const fieldName = `lm${lm}_tp${tp}` as keyof typeof grade
          worksheet.getCell(row, dataCol++).value = (grade as any)[fieldName] || '-'
        }
      }
      
      // Data Sumatif LM
      for (let lm = 1; lm <= 5; lm++) {
        const fieldName = `lm${lm}_sum` as keyof typeof grade
        worksheet.getCell(row, dataCol++).value = (grade as any)[fieldName] || '-'
      }
      
      // Data Sumatif Akhir Semester
      worksheet.getCell(row, dataCol++).value = (grade as any).semester_final || '-'
      
      // Style data rows
      for (let i = 1; i < dataCol; i++) {
        worksheet.getCell(row, i).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        worksheet.getCell(row, i).alignment = { horizontal: 'center', vertical: 'middle' }
      }
      
      row++
    })

    // Auto-width columns
    worksheet.columns.forEach((column) => {
      if (column && column.eachCell) {
        let maxLength = 0
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10
          if (columnLength > maxLength) {
            maxLength = columnLength
          }
        })
        column.width = maxLength < 10 ? 10 : maxLength
      }
    })

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Return file
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${subject.name}_Nilai.xlsx"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}