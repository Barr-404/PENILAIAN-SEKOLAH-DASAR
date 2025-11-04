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

    // Header
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Siswa', key: 'name', width: 25 },
      { header: 'NIS', key: 'nis', width: 15 },
      { header: 'Kelas', key: 'className', width: 10 },
      { header: 'Tugas Harian', key: 'tugasHarian', width: 15 },
      { header: 'UTS', key: 'ulanganTengahSemester', width: 12 },
      { header: 'UAS', key: 'ulanganAkhirSemester', width: 12 },
      { header: 'Rata-rata', key: 'average', width: 12 },
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

    // Data siswa
    subject.students.forEach((student, index) => {
      const grade = student.grades[0] // Ambil grade pertama (seharusnya hanya 1)
      
      worksheet.addRow({
        no: index + 1,
        name: student.name,
        nis: student.nis || '-',
        className: student.className || '-',
        tugasHarian: grade?.tugasHarian || '-',
        ulanganTengahSemester: grade?.ulanganTengahSemester || '-',
        ulanganAkhirSemester: grade?.ulanganAkhirSemester || '-',
        average: grade?.average || '-'
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