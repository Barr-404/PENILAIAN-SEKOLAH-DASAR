'use client'

// Komponen charts yang di-lazy load untuk performa lebih baik
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface DashboardChartsProps {
  gradeDistribution: { A: number; B: number; C: number; D: number; E: number }
  subjectAverages: Array<{ name: string; average: number }>
}

export default function DashboardCharts({ gradeDistribution, subjectAverages }: DashboardChartsProps) {
  // Grade Distribution Chart
  const totalGrades = Object.values(gradeDistribution).reduce((sum, val) => sum + val, 0)
  const gradePercentages = {
    A: totalGrades > 0 ? (gradeDistribution.A / totalGrades) * 100 : 0,
    B: totalGrades > 0 ? (gradeDistribution.B / totalGrades) * 100 : 0,
    C: totalGrades > 0 ? (gradeDistribution.C / totalGrades) * 100 : 0,
    D: totalGrades > 0 ? (gradeDistribution.D / totalGrades) * 100 : 0,
    E: totalGrades > 0 ? (gradeDistribution.E / totalGrades) * 100 : 0,
  }

  const gradeColors = {
    A: 'bg-green-500',
    B: 'bg-blue-500',
    C: 'bg-yellow-500',
    D: 'bg-orange-500',
    E: 'bg-red-500',
  }

  return (
    <>
      {/* Distribusi Nilai */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Distribusi Nilai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(gradeDistribution).map(([grade, count]) => (
              <div key={grade} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Nilai {grade}</span>
                  <span className="text-gray-600">
                    {count} siswa ({gradePercentages[grade as keyof typeof gradePercentages].toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${gradeColors[grade as keyof typeof gradeColors]}`}
                    style={{ width: `${gradePercentages[grade as keyof typeof gradePercentages]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rata-rata Per Mata Pelajaran */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Rata-rata Per Mata Pelajaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectAverages.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{subject.name}</span>
                  <span className="text-gray-600">{subject.average.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      subject.average >= 90 ? 'bg-green-500' :
                      subject.average >= 80 ? 'bg-blue-500' :
                      subject.average >= 70 ? 'bg-yellow-500' :
                      subject.average >= 60 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${subject.average}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
