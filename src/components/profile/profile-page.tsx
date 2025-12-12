'use client'

import { useState, useEffect, useRef } from 'react'
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
  XCircle,
  Upload,
  X,
  Trash2,
  AlertTriangle
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
  const { data: session, update } = useSession()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    nip: '',
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
      // Update session dengan data baru
      update({
        ...session,
        user: {
          ...session?.user,
          name: editForm.name,
          image: editForm.image
        }
      })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Gagal memperbarui profil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }

    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB')
      return
    }

    try {
      setIsUploadingImage(true)
      
      // Convert ke base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setEditForm({ ...editForm, image: base64String })
        toast.success('Foto berhasil dipilih')
      }
      reader.onerror = () => {
        toast.error('Gagal membaca file')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Gagal mengupload foto')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setEditForm({ ...editForm, image: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'HAPUS') {
      toast.error('Ketik "HAPUS" untuk mengkonfirmasi penghapusan akun')
      return
    }

    const confirmed = window.confirm(
      '⚠️ PERINGATAN TERAKHIR!\n\n' +
      'Menghapus akun akan:\n' +
      '• Menghapus SEMUA mata pelajaran Anda\n' +
      '• Menghapus SEMUA data siswa dan nilai\n' +
      '• Tindakan ini TIDAK DAPAT DIBATALKAN\n\n' +
      'Apakah Anda YAKIN ingin melanjutkan?'
    )

    if (!confirmed) return

    try {
      setIsSaving(true)
      
      const response = await fetch('/api/profile/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Gagal menghapus akun')
      }

      toast.success('Akun berhasil dihapus. Anda akan dialihkan...')
      
      // Sign out dan redirect ke halaman login
      setTimeout(() => {
        signOut({ callbackUrl: '/login' })
      }, 2000)
      
    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast.error(error.message || 'Gagal menghapus akun')
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
          onClick={() => signOut({ callbackUrl: '/login' })}
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
                  <div className="h-32 w-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-4 border-blue-100 shadow-lg">
                    <span className="text-white text-4xl font-bold">
                      {profileData.user.name?.charAt(0).toUpperCase() || 'G'}
                    </span>
                  </div>
                )}
                
                {isEditing && (
                  <>
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => setShowImageModal(true)}
                    >
                      <Camera className="h-6 w-6 text-white mb-1" />
                      <p className="text-xs text-white font-medium">Tambah foto profil</p>
                    </div>
                  </>
                )}
              </div>
              
              {isEditing && !editForm.image && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Klik pada foto untuk mengubah
                </p>
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
                  <p className="text-xs text-gray-500 mt-1">(Siswa unik)</p>
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

          {/* Zona Bahaya - Hapus Akun */}
          <Card className="border-2 border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Zona Bahaya
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {!showDeleteAccount ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Menghapus akun akan menghapus semua data Anda termasuk mata pelajaran, siswa, dan nilai secara permanen.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteAccount(true)}
                    className="border-red-600 text-red-600 hover:bg-red-50 w-full md:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Akun
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-red-900 mb-2">Peringatan!</h4>
                        <p className="text-sm text-red-800 mb-2">
                          Menghapus akun akan menghapus secara permanen:
                        </p>
                        <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                          <li>Semua mata pelajaran ({profileData?.statistics.totalSubjects} mata pelajaran)</li>
                          <li>Semua data siswa ({profileData?.statistics.totalStudents} siswa)</li>
                          <li>Semua nilai yang telah diinput ({profileData?.statistics.totalGrades} nilai)</li>
                          <li>Riwayat aktivitas dan data profil</li>
                        </ul>
                        <p className="text-sm font-bold text-red-900 mt-3">
                          ⚠️ Tindakan ini TIDAK DAPAT DIBATALKAN!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Ketik <span className="font-bold text-red-600">HAPUS</span> untuk mengkonfirmasi
                    </label>
                    <Input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Ketik HAPUS"
                      className="border-red-300 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteAccount(false)
                        setDeleteConfirmation('')
                      }}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={isSaving || deleteConfirmation !== 'HAPUS'}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isSaving ? 'Menghapus...' : 'Hapus Akun Permanen'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Upload Foto */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">Foto Profil</h3>
              <p className="text-blue-100 text-sm">Pilih atau upload foto profil Anda</p>
            </div>
            
            <div className="p-6">
              {/* Preview Foto */}
              <div className="flex justify-center mb-6">
                {editForm.image ? (
                  <div className="relative">
                    <img
                      src={editForm.image}
                      alt="Preview"
                      className="h-40 w-40 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                      title="Hapus foto"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="h-40 w-40 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-4 border-blue-100 shadow-lg">
                    <span className="text-white text-5xl font-bold">
                      {profileData.user.name?.charAt(0).toUpperCase() || 'G'}
                    </span>
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {isUploadingImage ? 'Mengupload...' : 'Upload foto'}
                </Button>

                {editForm.image && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-2 hover:bg-red-50 text-red-600 hover:text-red-700"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-5 w-5 mr-2" />
                    Hapus foto
                  </Button>
                )}

                <p className="text-xs text-gray-500 text-center pt-2">
                  File maksimal 2MB • Format: JPG, PNG, GIF
                </p>
              </div>

              {/* Close Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-12 text-base font-medium"
                  onClick={() => setShowImageModal(false)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
