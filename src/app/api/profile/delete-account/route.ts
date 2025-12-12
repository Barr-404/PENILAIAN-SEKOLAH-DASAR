import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Hapus dalam transaksi untuk memastikan semua data terhapus
    await prisma.$transaction(async (tx) => {
      // 1. Hapus semua grades dari students yang dimiliki user
      await tx.grade.deleteMany({
        where: {
          student: {
            subject: {
              teacherId: userId
            }
          }
        }
      })

      // 2. Hapus semua students dari subjects yang dimiliki user
      await tx.student.deleteMany({
        where: {
          subject: {
            teacherId: userId
          }
        }
      })

      // 3. Hapus semua subjects yang dimiliki user
      await tx.subject.deleteMany({
        where: {
          teacherId: userId
        }
      })

      // 4. Hapus user account
      await tx.user.delete({
        where: {
          id: userId
        }
      })
    })

    return NextResponse.json({
      message: 'Akun berhasil dihapus'
    })

  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
