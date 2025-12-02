'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Save, Check, Plus, Trash2 } from 'lucide-react'
import { debounce } from 'lodash'
import toast from 'react-hot-toast'

// CSS untuk menghilangkan spinner
const spinnerHideCSS = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`

interface Student {
  id: string
  name: string
  gender?: string | null
  notes?: string | null
  className?: string | null
  grades: Grade[]
}

interface Grade {
  id: string
  // Lingkup Materi 1
  lm1_tp1?: number | null
  lm1_tp2?: number | null
  lm1_tp3?: number | null
  lm1_tp4?: number | null
  lm1_sum?: number | null
  // Lingkup Materi 2
  lm2_tp1?: number | null
  lm2_tp2?: number | null
  lm2_tp3?: number | null
  lm2_tp4?: number | null
  lm2_sum?: number | null
  // Lingkup Materi 3
  lm3_tp1?: number | null
  lm3_tp2?: number | null
  lm3_tp3?: number | null
  lm3_tp4?: number | null
  lm3_sum?: number | null
  // Lingkup Materi 4
  lm4_tp1?: number | null
  lm4_tp2?: number | null
  lm4_tp3?: number | null
  lm4_tp4?: number | null
  lm4_sum?: number | null
  // Lingkup Materi 5
  lm5_tp1?: number | null
  lm5_tp2?: number | null
  lm5_tp3?: number | null
  lm5_tp4?: number | null
  lm5_sum?: number | null
  // Sumatif Akhir Semester
  semester_final?: number | null
}

interface GradesTableProps {
  subjectId: string
  subjectName: string
  students: Student[]
}

export default function GradesTable({ subjectId, subjectName, students: initialStudents }: GradesTableProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{[key: string]: 'saving' | 'saved' | 'error'}>({})
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [newStudentForm, setNewStudentForm] = useState({ name: '' })
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [students, setStudents] = useState(initialStudents)

  // Update students ketika initialStudents berubah
  useEffect(() => {
    setStudents(initialStudents)
  }, [initialStudents])

  // Debounced function untuk menyimpan nilai
  const debouncedSave = useCallback(
    debounce(async (gradeId: string, field: string, value: number | null) => {
      try {
        setSaveStatus(prev => ({ ...prev, [`${gradeId}_${field}`]: 'saving' }))
        
        const response = await fetch(`/api/grades/${gradeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value })
        })

        if (!response.ok) throw new Error('Failed to save')
        
        setSaveStatus(prev => ({ ...prev, [`${gradeId}_${field}`]: 'saved' }))
        setTimeout(() => {
          setSaveStatus(prev => {
            const newState = { ...prev }
            delete newState[`${gradeId}_${field}`]
            return newState
          })
        }, 2000)
        
      } catch (error) {
        setSaveStatus(prev => ({ ...prev, [`${gradeId}_${field}`]: 'error' }))
        toast.error('Gagal menyimpan nilai')
      }
    }, 1000),
    []
  )

  // Debounced function untuk menyimpan data siswa
  const debouncedSaveStudent = useCallback(
    debounce(async (studentId: string, field: string, value: string) => {
      try {
        setSaveStatus(prev => ({ ...prev, [`${studentId}_${field}`]: 'saving' }))
        
        const response = await fetch(`/api/students/${studentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value })
        })

        if (!response.ok) throw new Error('Failed to save')
        
        setSaveStatus(prev => ({ ...prev, [`${studentId}_${field}`]: 'saved' }))
        
        setTimeout(() => {
          setSaveStatus(prev => {
            const newState = { ...prev }
            delete newState[`${studentId}_${field}`]
            return newState
          })
        }, 2000)
        
      } catch (error) {
        setSaveStatus(prev => ({ ...prev, [`${studentId}_${field}`]: 'error' }))
        toast.error('Gagal menyimpan data siswa')
      }
    }, 1000),
    []
  )

  const handleValueChange = (gradeId: string, field: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    if (numValue !== null && (numValue < 0 || numValue > 100)) {
      toast.error('Nilai harus antara 0-100')
      return
    }
    debouncedSave(gradeId, field, numValue)
  }

  const handleStudentDataChange = (studentId: string, field: string, value: string) => {
    debouncedSaveStudent(studentId, field, value)
  }

  const handleAddStudent = async () => {
    if (!newStudentForm.name.trim()) {
      toast.error('Nama siswa wajib diisi')
      return
    }

    setIsAddingStudent(true)
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subjectId,
          name: newStudentForm.name.trim(),
          className: ''
        })
      })

      if (response.ok) {
        const newStudent = await response.json()
        // Tambah siswa baru ke state
        setStudents(prev => [...prev, newStudent])
        toast.success('Siswa baru berhasil ditambahkan')
        setNewStudentForm({ name: '' })
        setShowAddStudentModal(false)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Gagal menambah siswa')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menambah siswa')
    } finally {
      setIsAddingStudent(false)
    }
  }

  const openAddStudentModal = () => {
    setNewStudentForm({ name: '' })
    setShowAddStudentModal(true)
  }

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    const userConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus siswa "${studentName}"?\n\nSemua data nilai siswa ini akan ikut terhapus dan tidak dapat dikembalikan.`
    )
    
    if (!userConfirmed) {
      return
    }

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Update state tanpa reload
        setStudents(prev => prev.filter(s => s.id !== studentId))
        toast.success('Siswa berhasil dihapus')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Gagal menghapus siswa')
      }
    } catch (error) {
      console.error('Delete student error:', error)
      toast.error('Terjadi kesalahan saat menghapus siswa')
    }
  }

  const handleExport = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/grades/export?subjectId=${subjectId}`)
      
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${subjectName}_Nilai.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('File Excel berhasil didownload')
    } catch (error) {
      toast.error('Gagal mengekspor data')
    } finally {
      setIsLoading(false)
    }
  }

  const renderEditableCell = (student: Student, field: string, placeholder = '-') => {
    const grade = student.grades[0]
    if (!grade) {
      return (
        <td key={`${student.id}_${field}`} className="border border-gray-400 p-0 bg-white">
          <div className="h-8" />
        </td>
      )
    }
    
    const gradeId = grade.id
    const value = (grade as any)[field]
    const cellKey = `${gradeId}_${field}`
    const status = saveStatus[cellKey]

    return (
      <td key={`${student.id}_${field}`} className="border border-gray-400 p-0 bg-white relative">
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            defaultValue={value || ''}
            placeholder=""
            onChange={(e) => handleValueChange(gradeId, field, e.target.value)}
            className="border-0 rounded-none text-center h-8 text-base font-medium focus:ring-1 focus:ring-blue-500 focus:bg-blue-50 w-full min-w-[50px] bg-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{
              MozAppearance: 'textfield'
            }}
          />
          {status && (
            <div className="absolute top-0 right-0 p-1">
              {status === 'saving' && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              )}
              {status === 'saved' && (
                <Check className="w-2 h-2 text-green-500" />
              )}
              {status === 'error' && (
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
          )}
        </div>
      </td>
    )
  }

  const renderEditableStudentCell = (student: Student, field: string, type: 'text' | 'number' = 'text') => {
    const value = (student as any)[field]
    const cellKey = `${student.id}_${field}`
    const status = saveStatus[cellKey]

    // Tentukan placeholder berdasarkan field dan apakah value kosong
    let placeholder = ''
    const isEmpty = !value || value.toString().trim() === '' || value === 'Siswa Baru'
    
    if (field === 'name' && isEmpty) {
      placeholder = 'Input Nama'
    } else if (field === 'gender' && isEmpty) {
      placeholder = 'L/P'
    } else if (field === 'notes' && isEmpty) {
      placeholder = 'Keterangan'
    }

    // Tentukan alignment dan styling berdasarkan field
    const isNameField = field === 'name'
    const textAlign = isNameField ? 'text-left' : 'text-center'
    const padding = isNameField ? 'px-3' : ''

    return (
      <td key={`${student.id}_${field}`} className="border border-gray-400 p-0 bg-white relative">
        <div className="relative">
          <input
            type={type}
            defaultValue={isEmpty ? '' : value}
            placeholder={placeholder}
            onChange={(e) => handleStudentDataChange(student.id, field, e.target.value)}
            className={`border-0 rounded-none ${textAlign} ${padding} h-auto py-2 text-base font-medium focus:ring-1 focus:ring-blue-500 focus:bg-blue-50 bg-white outline-none placeholder:text-gray-400 placeholder:text-sm`}
            style={isNameField ? {width: '100%', minWidth: '250px'} : {width: '100%', minWidth: '50px'}}
          />
          {status && (
            <div className="absolute top-0 right-0 p-1">
              {status === 'saving' && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              )}
              {status === 'saved' && (
                <Check className="w-2 h-2 text-green-500" />
              )}
              {status === 'error' && (
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
          )}
        </div>
      </td>
    )
  }

  return (
    <div className="space-y-6">
      {/* CSS untuk menghilangkan spinner */}
      <style dangerouslySetInnerHTML={{ __html: spinnerHideCSS }} />
      
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-blue-600">📊 {subjectName}</CardTitle>
              <p className="text-gray-600 mt-1">{students.length} siswa terdaftar</p>
            </div>
            <Button 
              onClick={openAddStudentModal}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Siswa
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Excel-like Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[70vh] border border-gray-400">
            <table className="border-collapse bg-white text-sm" style={{tableLayout: 'auto'}}>
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th className="border border-gray-400 p-2 text-center font-bold bg-gray-100" style={{width: '50px'}}>
                    NO
                  </th>
                  <th className="border border-gray-400 p-2 text-left font-bold bg-gray-100" style={{minWidth: '250px', width: 'auto'}}>
                    NAMA
                  </th>
                  <th className="border border-gray-400 p-2 text-center font-bold min-w-[60px] bg-gray-100">
                    L/P
                  </th>
                  <th className="border border-gray-400 p-2 text-center font-bold min-w-[70px] bg-blue-100">
                    LM1
                  </th>
                  <th className="border border-gray-400 p-2 text-center font-bold min-w-[70px] bg-blue-100">
                    LM2
                  </th>
                  <th className="border border-gray-400 p-2 text-center font-bold min-w-[70px] bg-blue-100">
                    LM3
                  </th>
                  <th className="border border-gray-400 p-2 text-center font-bold min-w-[70px] bg-blue-100">
                    LM4
                  </th>
                  <th className="border border-gray-400 p-2 text-center font-bold min-w-[70px] bg-blue-100">
                    LM5
                  </th>
                  <th className="border border-gray-400 p-2 text-center font-bold min-w-[70px] bg-blue-100">
                    LM6
                  </th>
                  <th className="border border-gray-400 p-2 text-center font-bold min-w-[70px] bg-green-100">
                    SAS
                  </th>
                  <th className="border border-gray-400 p-2 text-center font-bold min-w-[70px] bg-yellow-100">
                    NR
                  </th>
                  <th className="border border-gray-400 p-2 text-center font-bold min-w-[100px] bg-purple-100">
                    KET
                  </th>
                  <th className="border border-gray-400 p-2 text-center font-bold bg-red-100 min-w-[60px]">
                    HAPUS
                  </th>
                </tr>
              </thead>
              
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="border border-gray-400 p-2 text-center font-medium bg-gray-50">
                      {index + 1}
                    </td>
                    {renderEditableStudentCell(student, 'name')}
                    {renderEditableStudentCell(student, 'gender')}
                    
                    {/* Sumatif Akhir Lingkup Materi LM1-LM6 */}
                    {renderEditableCell(student, 'lm1_sum')}
                    {renderEditableCell(student, 'lm2_sum')}
                    {renderEditableCell(student, 'lm3_sum')}
                    {renderEditableCell(student, 'lm4_sum')}
                    {renderEditableCell(student, 'lm5_sum')}
                    {renderEditableCell(student, 'lm6_sum')}
                    
                    {/* SAS (Sumatif Akhir Semester) */}
                    {renderEditableCell(student, 'semester_final')}
                    
                    {/* NR (Nilai Rapor) */}
                    {renderEditableCell(student, 'final_score')}
                    
                    {/* KET (Keterangan) */}
                    {renderEditableStudentCell(student, 'notes')}
                    
                    {/* Kolom Hapus Siswa */}
                    <td className="border border-gray-400 p-0 bg-red-50 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id, student.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-200 h-8 w-8 p-0"
                        title={`Hapus siswa ${student.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-400">
            <p className="text-sm text-gray-600">
              📋 <strong>Petunjuk:</strong> Geser tabel ke kiri-kanan untuk melihat semua kolom. 
              Nilai akan otomatis tersimpan setelah Anda selesai mengetik (0-100).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal Tambah Siswa */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Tambah Siswa Baru</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddStudentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddStudent(); }} className="space-y-4">
              <div>
                <label htmlFor="student-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  id="student-name"
                  type="text"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Masukkan nama lengkap siswa"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddStudentModal(false)}
                  disabled={isAddingStudent}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingStudent || !newStudentForm.name.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isAddingStudent ? 'Menyimpan...' : 'Tambah Siswa'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legend */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Menyimpan...</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3 h-3 text-green-500" />
              <span>Tersimpan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Error</span>
            </div>
            <span className="ml-4">💡 Nilai: 0-100, otomatis tersimpan setelah 1 detik</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}