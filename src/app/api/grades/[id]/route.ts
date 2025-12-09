import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const gradeId = params.id

    // Verifikasi bahwa grade ini milik guru yang login
    const grade = await prisma.grade.findFirst({
      where: {
        id: gradeId,
        student: {
          subject: {
            teacherId: session.user.id
          }
        }
      }
    })

    if (!grade) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      )
    }

    // Update grade dengan field yang dikirim
    const allowedFields = [
      'lm1_tp1', 'lm1_tp2', 'lm1_tp3', 'lm1_tp4', 'lm1_sum',
      'lm2_tp1', 'lm2_tp2', 'lm2_tp3', 'lm2_tp4', 'lm2_sum',
      'lm3_tp1', 'lm3_tp2', 'lm3_tp3', 'lm3_tp4', 'lm3_sum',
      'lm4_tp1', 'lm4_tp2', 'lm4_tp3', 'lm4_tp4', 'lm4_sum',
      'lm5_tp1', 'lm5_tp2', 'lm5_tp3', 'lm5_tp4', 'lm5_sum',
      'lm6_tp1', 'lm6_tp2', 'lm6_tp3', 'lm6_tp4', 'lm6_sum',
      'semester_final', 'final_score'
    ]

    const updateData: any = {}
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value
      }
    }

    const updatedGrade = await prisma.grade.update({
      where: { id: gradeId },
      data: updateData
    })

    return NextResponse.json({
      message: 'Grade updated successfully',
      grade: updatedGrade
    })

  } catch (error) {
    console.error('Update grade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}