import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StudentsPage from '@/components/students/students-page-client'

export const dynamic = 'force-dynamic'

async function getStudentsData(teacherId: string) {
  try {
    // Ambil semua subjects milik guru dengan query yang lebih efisien
    const subjects = await prisma.subject.findMany({
      where: { teacherId },
      select: {
        id: true,
        name: true,
        students: {
          select: {
            id: true,
            name: true,
            nis: true,
            className: true,
            grades: {
              select: {
                id: true,
                lm1_sum: true,
                lm2_sum: true,
                lm3_sum: true,
                lm4_sum: true,
                lm5_sum: true,
                lm6_sum: true,
                semester_final: true,
                final_score: true,
              },
              take: 1,
              orderBy: {
                updatedAt: 'desc'
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Transform data untuk komponen - group by student name to get all subjects
    const studentScoresMap = new Map<string, {
      id: string
      name: string
      nis?: string
      className?: string
      scores: number[]
    }>()

    subjects.forEach(subject => {
      subject.students.forEach(student => {
        const grade = student.grades[0]
        
        if (!studentScoresMap.has(student.name)) {
          studentScoresMap.set(student.name, {
            id: student.id,
            name: student.name,
            nis: student.nis ?? undefined,
            className: student.className ?? undefined,
            scores: []
          })
        }
        
        // Add final_score from this subject if available
        if (grade?.final_score !== null && grade?.final_score !== undefined) {
          studentScoresMap.get(student.name)!.scores.push(grade.final_score)
        }
      })
    })

    // Calculate average across all subjects for each student
    const uniqueStudents = Array.from(studentScoresMap.values()).map(student => {
      const avgScore = student.scores.length > 0
        ? student.scores.reduce((a, b) => a + b, 0) / student.scores.length
        : 0
      
      return {
        id: student.id,
        name: student.name,
        nis: student.nis,
        className: student.className,
        finalScore: avgScore,
        averageGrade: avgScore,
      }
    })

    // Calculate rankings berdasarkan finalScore
    const sortedByScore = [...uniqueStudents].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
    const studentsWithRanking = sortedByScore.map((student, index) => ({
      ...student,
      ranking: index + 1
    }))

    // Get unique classes dari student.className saja, lalu sort
    const classNamesFromStudents = uniqueStudents
      .map(s => s.className)
      .filter((c): c is string => Boolean(c))
    const availableClasses: string[] = Array.from(new Set(classNamesFromStudents)).sort()
    
    // Get subjects list
    const availableSubjects = subjects.map(s => ({ id: s.id, name: s.name }))

    return {
      students: studentsWithRanking,
      availableClasses,
      availableSubjects
    }
  } catch (error) {
    console.error('Error fetching students data:', error)
    return {
      students: [],
      availableClasses: [],
      availableSubjects: []
    }
  }
}

export default async function StudentsPageWrapper() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const data = await getStudentsData(session.user.id)

  return (
    <StudentsPage 
      initialStudents={data.students}
      availableClasses={data.availableClasses}
      availableSubjects={data.availableSubjects}
    />
  )
}
