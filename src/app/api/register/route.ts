import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { name, email, password, kelas, fase } = await request.json()

    // Validasi input wajib
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Kelas dan fase opsional untuk sementara
    // if (!kelas || !fase) {
    //   return NextResponse.json(
    //     { error: 'Kelas dan fase pembelajaran wajib dipilih' },
    //     { status: 400 }
    //   )
    // }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Buat user baru (sementara tanpa kelas dan fase)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // kelas, // Sementara dinonaktifkan sampai Prisma generate ulang
        // fase   // Sementara dinonaktifkan sampai Prisma generate ulang
      },
      select: {
        id: true,
        name: true,
        email: true,
        // kelas: true, // Sementara dinonaktifkan
        // fase: true   // Sementara dinonaktifkan
      }
    })

    return NextResponse.json(
      { message: 'Akun berhasil dibuat', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}