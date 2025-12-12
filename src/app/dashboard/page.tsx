import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardStats from '@/components/dashboard/dashboard-stats'

export const revalidate = 60 // Revalidate setiap 60 detik

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  // Ambil semua data untuk dashboard dengan error handling dan optimasi query
  let subjects
  try {
    subjects = await prisma.subject.findMany({
    where: { teacherId: session.user.id },
    select: {
      id: true,
      name: true,
      semester: true,
      students: {
        select: {
          id: true,
          name: true,
          grades: {
            select: {
              final_score: true,
              lm1_sum: true,
              lm2_sum: true,
              lm3_sum: true,
              lm4_sum: true,
              lm5_sum: true,
              lm6_sum: true,
              semester_final: true,
            },
            take: 1,
            orderBy: { updatedAt: 'desc' }
          }
        }
      },
      _count: {
        select: { students: true }
      }
    },
    orderBy: { name: 'asc' }
  })
  } catch (error) {
    console.error('Database connection error:', error)
    // Return default empty data if database is not available
    subjects = []
  }

  // Hitung statistik
  const subjectCount = subjects.length
  const studentCount = subjects.reduce((sum, s) => sum + s._count.students, 0)
  
  // Hitung unique students (deduplicate by name)
  const allStudents = subjects.flatMap(s => s.students)
  const uniqueStudentNames = new Set(allStudents.map(s => s.name))
  const uniqueStudentCount = uniqueStudentNames.size

  // Hitung rata-rata nilai per subject
  const subjectAverages = subjects.map(subject => {
    const students = subject.students
    if (students.length === 0) return { name: subject.name, average: 0 }
    
    const validScores = students
      .map(s => s.grades[0]?.final_score)
      .filter((score): score is number => score !== null && score !== undefined)
    
    const average = validScores.length > 0
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
      : 0
    
    return { name: subject.name, average: Math.round(average * 10) / 10 }
  })

  // Hitung distribusi nilai (A, B, C, D, E)
  const allGrades = allStudents
    .map(s => s.grades[0]?.final_score)
    .filter((score): score is number => score !== null && score !== undefined)
  
  const gradeDistribution = {
    A: allGrades.filter(s => s >= 90).length,
    B: allGrades.filter(s => s >= 75 && s < 90).length,
    C: allGrades.filter(s => s >= 60 && s < 75).length,
    D: allGrades.filter(s => s >= 50 && s < 60).length,
    E: allGrades.filter(s => s < 50).length,
  }

  // Siswa berprestasi (top 5)
  const topStudents = allStudents
    .map(s => ({
      name: s.name,
      score: s.grades[0]?.final_score || 0,
      subjectName: subjects.find(sub => sub.students.some(st => st.id === s.id))?.name || ''
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  // Siswa yang perlu perhatian (bottom 5 dengan nilai < 75)
  const needsAttention = allStudents
    .map(s => ({
      name: s.name,
      score: s.grades[0]?.final_score || 0,
      subjectName: subjects.find(sub => sub.students.some(st => st.id === s.id))?.name || ''
    }))
    .filter(s => s.score > 0 && s.score < 75)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)

  // Hitung siswa yang belum dinilai
  const ungradedCount = allStudents.filter(s => {
    const grade = s.grades[0]
    return !grade?.final_score && !grade?.lm1_sum && !grade?.lm2_sum
  }).length

  // Rata-rata keseluruhan
  const overallAverage = allGrades.length > 0
    ? Math.round((allGrades.reduce((sum, s) => sum + s, 0) / allGrades.length) * 10) / 10
    : 0

  // Persentase kelulusan (nilai >= 75)
  const passedCount = allGrades.filter(s => s >= 75).length
  const passPercentage = allGrades.length > 0
    ? Math.round((passedCount / allGrades.length) * 100)
    : 0

  return (
    <DashboardStats 
      subjectCount={subjectCount}
      studentCount={uniqueStudentCount}
      overallAverage={overallAverage}
      passPercentage={passPercentage}
      subjectAverages={subjectAverages}
      gradeDistribution={gradeDistribution}
      topStudents={topStudents}
      needsAttention={needsAttention}
      ungradedCount={ungradedCount}
      teacherName={session.user.name || 'Guru'}
    />
  )
}