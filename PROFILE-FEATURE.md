# Fitur Profil Guru

## Deskripsi
Halaman **Profil Guru** adalah pengganti dari halaman Pengaturan yang menyediakan informasi lengkap tentang akun guru, data mengajar, dan pengaturan keamanan.

## Fitur Utama

### 1. Informasi Akun
- **Nama Lengkap**: Nama guru yang dapat diedit
- **Email**: Email login (tidak dapat diubah)
- **NIP**: Nomor Induk Pegawai (opsional)
- **Kelas yang Diajar**: Informasi kelas yang diampu
- **Fase Pembelajaran**: Fase pembelajaran (A, B, atau C)

### 2. Foto Profil
- Menampilkan foto profil guru atau inisial jika tidak ada foto
- Upload foto profil melalui URL gambar
- Preview foto profil secara real-time
- Hover effect untuk mengubah foto

### 3. Status Akun
- **Status**: Menampilkan status akun (Aktif/Nonaktif)
- **Terdaftar sejak**: Tanggal pembuatan akun
- **Terakhir update**: Tanggal terakhir profil diperbarui

### 4. Data Mengajar
Dashboard statistik yang menampilkan:
- **Total Mata Pelajaran**: Jumlah mata pelajaran yang diajar
- **Total Siswa**: Jumlah total siswa di semua mata pelajaran
- **Nilai Diinput**: Jumlah total nilai yang sudah diinput
- **Rata-rata per Mapel**: Rata-rata jumlah siswa per mata pelajaran

Daftar mata pelajaran yang diajar dengan informasi:
- Nama mata pelajaran
- Jumlah siswa
- Tanggal terakhir update

### 5. Aktivitas Terakhir
Menampilkan riwayat aktivitas guru:
- **Terakhir Login**: Waktu login terakhir
- **Update Mata Pelajaran**: Waktu terakhir mengubah mata pelajaran
- **Input Nilai Terakhir**: Waktu terakhir menginput nilai siswa

### 6. Pengaturan Keamanan
- **Ganti Password**: Form untuk mengubah password dengan validasi
  - Password lama (wajib)
  - Password baru (minimal 6 karakter)
  - Konfirmasi password baru
- Validasi password lama sebelum mengubah
- Toast notification untuk feedback

### 7. Tombol Aksi
- **Edit Profil**: Mengaktifkan mode edit untuk mengubah informasi
- **Simpan**: Menyimpan perubahan profil
- **Batal**: Membatalkan perubahan
- **Keluar**: Logout dari aplikasi

## Navigasi
Menu **Profil Guru** dapat diakses dari sidebar dengan ikon UserCircle atau melalui URL:
```
/dashboard/profile
```

## API Endpoints

### GET /api/profile
Mengambil data profil guru lengkap dengan statistik dan aktivitas.

**Response:**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string",
    "nip": "string",
    "kelas": "string",
    "fase": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  },
  "statistics": {
    "totalSubjects": 5,
    "totalStudents": 150,
    "totalGrades": 750,
    "averageStudentsPerSubject": 30
  },
  "subjects": [...],
  "lastActivity": {
    "lastLogin": "datetime",
    "lastSubjectUpdate": "datetime",
    "lastGradeUpdate": "datetime"
  }
}
```

### PUT /api/profile
Memperbarui informasi profil guru.

**Request Body:**
```json
{
  "name": "string",
  "nip": "string",
  "kelas": "string",
  "fase": "string",
  "image": "string"
}
```

### POST /api/profile/change-password
Mengubah password guru.

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

## Komponen

### ProfilePage (`src/components/profile/profile-page.tsx`)
Komponen utama halaman profil dengan state management untuk:
- Data profil
- Mode edit
- Form edit profil
- Form ganti password
- Loading states

### Layout
Menggunakan grid layout responsif:
- Desktop: 3 kolom (1 untuk sidebar profil, 2 untuk konten utama)
- Mobile: 1 kolom (stack layout)

## Styling
- Menggunakan Tailwind CSS dan shadcn/ui components
- Tema konsisten dengan halaman lainnya (biru-putih)
- Card-based design untuk setiap section
- Responsive design untuk mobile dan desktop
- Hover effects dan transitions

## Validasi
- Nama wajib diisi saat update profil
- Password lama harus benar saat ganti password
- Password baru minimal 6 karakter
- Password baru dan konfirmasi harus sama
- Toast notification untuk semua validasi

## Keamanan
- Hanya user yang login dapat mengakses halaman ini
- Verifikasi session untuk setiap API call
- Password di-hash menggunakan bcryptjs
- Tidak ada data sensitif yang ter-expose di client

## Dependencies Tambahan
```json
{
  "date-fns": "^latest" // Untuk formatting tanggal
}
```

## Migration dari Pengaturan
Perubahan yang dilakukan:
1. Route berubah dari `/dashboard/settings` ke `/dashboard/profile`
2. Icon berubah dari `Settings` ke `UserCircle`
3. Nama menu berubah dari "Pengaturan" ke "Profil Guru"
4. Penambahan fitur statistik mengajar
5. Penambahan aktivitas terakhir
6. Upload foto profil
7. Data kelas dan fase pembelajaran

## Testing
Untuk test fitur ini:
1. Login ke aplikasi
2. Klik menu "Profil Guru" di sidebar
3. Test edit profil:
   - Klik "Edit Profil"
   - Ubah informasi
   - Klik "Simpan"
4. Test ganti password:
   - Klik "Ganti Password"
   - Isi form
   - Klik "Ubah Password"
5. Test upload foto:
   - Klik "Edit Profil"
   - Masukkan URL foto
   - Klik "Simpan"

## Screenshots
(Tambahkan screenshots di sini jika perlu)

## Known Issues
- Upload foto hanya mendukung URL eksternal (belum ada upload file lokal)
- Foto profil tidak ter-sync dengan NextAuth session (perlu refresh)

## Future Enhancements
- Upload foto profil dari file lokal
- Crop dan resize foto profil
- Sinkronisasi foto dengan NextAuth session
- Export profil ke PDF
- Notifikasi email saat password diubah
- Two-factor authentication
