'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  UserCircle, 
  Mail, 
  BookOpen, 
  Users, 
  FileText, 
  Calendar, 
  Edit3, 
  Key,
  LogOut,
  Camera,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ProfileData {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    nip: string | null
    kelas: string | null
    fase: string | null
    createdAt: string
    updatedAt: string
  }
  statistics: {
    totalSubjects: number
    totalStudents: number
    totalGrades: number
    averageStudentsPerSubject: number
  }
  subjects: Array<{
    id: string
    name: string
    createdAt: string
    updatedAt: string
    _count: {
      students: number
    }
  }>
  lastActivity: {
    lastLogin: string
    lastSubjectUpdate: string | null
    lastGradeUpdate: string | null
  }
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    nip: '',
    kelas: '',
    fase: '',
    image: ''
  })

  // Change password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/profile')
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data profil')
      }
      
      const data = await response.json()
      setProfileData(data)
      setEditForm({
        name: data.user.name || '',
        nip: data.user.nip || '',
        kelas: data.user.kelas || '',
        fase: data.user.fase || '',
        image: data.user.image || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Gagal mengambil data profil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Gagal memperbarui profil')
      }

      toast.success('Profil berhasil diperbarui')
      setIsEditing(false)
      fetchProfileData()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Gagal memperbarui profil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('Password baru dan konfirmasi tidak sama')
        return
      }

      if (passwordForm.newPassword.length < 6) {
        toast.error('Password baru minimal 6 karakter')
        return
      }

      setIsSaving(true)
      
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Gagal mengubah password')
      }

      toast.success('Password berhasil diubah')
      setShowChangePassword(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast.error(error.message || 'Gagal mengubah password')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: id })
    } catch (error) {
      return '-'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data profil...</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Gagal memuat data profil</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profil Guru</h1>
          <p className="text-gray-600 mt-2">Kelola informasi akun dan data mengajar Anda</p>
        </div>
        <Button
          variant="outline"
          onClick={() => signOut()}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Keluar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Foto Profil & Informasi Akun */}
        <div className="lg:col-span-1 space-y-6">
          {/* Foto Profil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                Foto Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative group">
                {editForm.image ? (
                  <img
                    src={editForm.image}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="h-32 w-32 bg-blue-500 rounded-full flex items-center justify-center border-4 border-blue-100">
                    <span className="text-white text-4xl font-bold">
                      {profileData.user.name?.charAt(0).toUpperCase() || 'G'}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              
              {isEditing && (
                <div className="mt-4 w-full">
                  <Input
                    type="url"
                    placeholder="URL foto profil"
                    value={editForm.image}
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Masukkan URL gambar profil Anda
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Akun */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Status Akun
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Terdaftar sejak</span>
                  <span className="text-sm font-medium">
                    {format(new Date(profileData.user.createdAt), 'MMM yyyy', { locale: id })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Terakhir update</span>
                  <span className="text-sm font-medium">
                    {format(new Date(profileData.user.updatedAt), 'dd MMM yyyy', { locale: id })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informasi Akun */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-blue-600" />
                Informasi Akun
              </CardTitle>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setEditForm({
                        name: profileData.user.name || '',
                        nip: profileData.user.nip || '',
                        kelas: profileData.user.kelas || '',
                        fase: profileData.user.fase || '',
                        image: profileData.user.image || ''
                      })
                    }}
                    disabled={isSaving}
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                  {isEditing ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Nama lengkap"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{profileData.user.name || '-'}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{profileData.user.email || '-'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">NIP</label>
                  {isEditing ? (
                    <Input
                      value={editForm.nip}
                      onChange={(e) => setEditForm({ ...editForm, nip: e.target.value })}
                      placeholder="Nomor Induk Pegawai"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{profileData.user.nip || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Kelas yang Diajar</label>
                  {isEditing ? (
                    <Input
                      value={editForm.kelas}
                      onChange={(e) => setEditForm({ ...editForm, kelas: e.target.value })}
                      placeholder="Contoh: 1, 2, 3"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{profileData.user.kelas || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Fase Pembelajaran</label>
                  {isEditing ? (
                    <Input
                      value={editForm.fase}
                      onChange={(e) => setEditForm({ ...editForm, fase: e.target.value })}
                      placeholder="Contoh: A, B, C"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{profileData.user.fase || '-'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Mengajar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Data Mengajar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {profileData.statistics.totalSubjects}
                  </p>
                  <p className="text-sm text-gray-600">Mata Pelajaran</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {profileData.statistics.totalStudents}
                  </p>
                  <p className="text-sm text-gray-600">Total Siswa</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {profileData.statistics.totalGrades}
                  </p>
                  <p className="text-sm text-gray-600">Nilai Diinput</p>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {profileData.statistics.averageStudentsPerSubject}
                  </p>
                  <p className="text-sm text-gray-600">Rata-rata/Mapel</p>
                </div>
              </div>

              {profileData.subjects.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Mata Pelajaran yang Diajar</h4>
                  <div className="space-y-2">
                    {profileData.subjects.map((subject) => (
                      <div 
                        key={subject.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{subject.name}</p>
                            <p className="text-sm text-gray-600">
                              {subject._count.students} siswa
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Update: {format(new Date(subject.updatedAt), 'dd MMM', { locale: id })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aktivitas Terakhir */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Aktivitas Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Terakhir Login</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(profileData.lastActivity.lastLogin)}
                  </span>
                </div>
                
                {profileData.lastActivity.lastSubjectUpdate && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Update Mata Pelajaran</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(profileData.lastActivity.lastSubjectUpdate)}
                    </span>
                  </div>
                )}

                {profileData.lastActivity.lastGradeUpdate && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Input Nilai Terakhir</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(profileData.lastActivity.lastGradeUpdate)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tombol Aksi */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Keamanan</CardTitle>
            </CardHeader>
            <CardContent>
              {!showChangePassword ? (
                <Button
                  variant="outline"
                  onClick={() => setShowChangePassword(true)}
                  className="w-full md:w-auto"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Ganti Password
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Password Lama</label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Masukkan password lama"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Password Baru</label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Masukkan password baru"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Konfirmasi password baru"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowChangePassword(false)
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      }}
                      disabled={isSaving}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      disabled={isSaving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSaving ? 'Mengubah...' : 'Ubah Password'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
