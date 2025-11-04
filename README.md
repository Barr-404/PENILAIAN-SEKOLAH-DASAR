# Sistem Penilaian Sekolah Dasar

Website profesional untuk guru sekolah dasar dalam mengelola nilai siswa, dibuat dengan Next.js 14 dan PostgreSQL.

## Fitur Utama

✅ **Autentikasi Guru**
- Login dan register dengan validasi email unik
- Sistem keamanan menggunakan NextAuth.js
- Satu akun per guru (tidak boleh duplikat)

✅ **Manajemen Mata Pelajaran**
- Tambah, edit, dan hapus mata pelajaran
- Dashboard statistik mata pelajaran

✅ **Manajemen Siswa & Nilai**
- Tambah siswa ke mata pelajaran
- Input nilai tugas, ulangan, dan rata-rata
- Sistem pencarian dan filter siswa

✅ **Ekspor ke Excel**
- Export data nilai siswa ke file .xlsx
- Nama file otomatis: `Nilai_<MataPelajaran>_<NamaGuru>.xlsx`

✅ **Desain Responsif**
- Tampilan profesional dengan tema biru dan putih
- Dashboard dengan sidebar navigation
- Mobile-friendly interface

## Teknologi yang Digunakan

- **Framework**: Next.js 14 (App Router)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Excel Export**: ExcelJS
- **Hosting**: Vercel Ready

## Struktur Database

```prisma
// User (Guru)
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?
  nip           String?   @unique
  subjects      Subject[]
}

// Mata Pelajaran
model Subject {
  id        String   @id @default(cuid())
  name      String
  teacherId String
  teacher   User     @relation(fields: [teacherId], references: [id])
  students  Student[]
}

// Siswa
model Student {
  id        String   @id @default(cuid())
  name      String
  nis       String?
  className String?
  subjectId String
  subject   Subject  @relation(fields: [subjectId], references: [id])
  grades    Grade[]
}

// Nilai
model Grade {
  id        String   @id @default(cuid())
  studentId String
  student   Student  @relation(fields: [studentId], references: [id])
  tugas     Float?
  ulangan   Float?
  average   Float?
}
```

## 🚀 Setup Proyek (Quick Start)

### Metode 1: Setup Otomatis (Recommended)

1. **Install Node.js** dari [nodejs.org](https://nodejs.org) - pilih versi LTS
2. **Jalankan setup otomatis:**
   ```cmd
   setup.bat
   ```
   Script ini akan otomatis:
   - Install dependencies
   - Setup database
   - Jalankan development server

### Metode 2: Setup Manual

1. **Install Node.js** dari [nodejs.org](https://nodejs.org)

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Cek file .env.local** (sudah dikonfigurasi dengan database Neon Anda):
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_gG9uO2TiLMNl@ep-lucky-flower-a1j0dfic-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="super-secret-key-minimal-32-characters-untuk-keamanan-tinggi"
   ```

4. **Setup Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```

6. **Buka browser:** `http://localhost:3000`

### ✅ Test Fitur Utama

Setelah website berjalan, test fitur berikut:
1. **Register** akun guru baru di `/register`
2. **Login** dengan akun yang dibuat
3. **Tambah mata pelajaran** di dashboard
4. **Tambah siswa** ke mata pelajaran
5. **Input nilai** siswa
6. **Export Excel** - download otomatis

### 🔧 Troubleshooting

**Error: "node is not recognized"**
- Install Node.js dari nodejs.org
- Restart Command Prompt/PowerShell

**Error: "Cannot connect to database"**
- Cek koneksi internet
- Pastikan DATABASE_URL di .env.local benar

**Error: TypeScript errors**
- Jalankan: `npm install`
- Restart VS Code

## Deployment ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com)
2. Import project dari GitHub
3. Tambahkan environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (domain production Anda)
   - `NEXTAUTH_SECRET`

### 3. Setup Database Production

```bash
# Dari local, push schema ke production database
npx prisma db push
```

## Panduan Penggunaan

### Untuk Guru

1. **Registrasi**
   - Kunjungi `/register`
   - Isi nama, email, password, dan NIP (opsional)
   - Satu email hanya bisa digunakan untuk satu akun

2. **Login**
   - Kunjungi `/login`
   - Masukkan email dan password

3. **Dashboard**
   - Lihat statistik mata pelajaran dan siswa
   - Akses cepat ke fitur-fitur utama

4. **Mata Pelajaran**
   - Tambah mata pelajaran baru
   - Edit atau hapus mata pelajaran
   - Lihat jumlah siswa per mata pelajaran

5. **Siswa & Nilai**
   - Tambah siswa ke mata pelajaran
   - Input nilai tugas, ulangan
   - Sistem otomatis menghitung rata-rata
   - Cari siswa berdasarkan nama

6. **Export Excel**
   - Klik tombol "Export ke Excel" di halaman mata pelajaran
   - File otomatis terdownload dengan nama: `Nilai_MataPelajaran_NamaGuru.xlsx`

## Struktur Folder

```
src/
├── app/
│   ├── api/                 # API Routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── register/       # User registration
│   │   ├── subjects/       # Subject CRUD
│   │   └── students/       # Student CRUD
│   ├── dashboard/          # Protected dashboard pages
│   │   ├── subjects/       # Subject management
│   │   └── students/       # Student management
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── dashboard/          # Dashboard-specific components
│   ├── subjects/           # Subject-related components
│   └── providers/          # Context providers
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
└── prisma/
    └── schema.prisma      # Database schema
```

## Fitur Keamanan

- ✅ Password hashing dengan bcryptjs
- ✅ Session management dengan NextAuth.js
- ✅ Protected routes untuk dashboard
- ✅ CSRF protection
- ✅ Input validation dan sanitization
- ✅ Unique constraints untuk email dan NIP

## Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/nama-fitur`)
3. Commit changes (`git commit -am 'Tambah fitur baru'`)
4. Push ke branch (`git push origin feature/nama-fitur`)
5. Buat Pull Request

## Lisensi

MIT License - silakan gunakan untuk proyek pendidikan dan komersial.

## Support

Jika mengalami masalah atau butuh bantuan:
1. Cek dokumentasi di README ini
2. Buka issue di GitHub repository
3. Pastikan environment variables sudah benar
4. Cek koneksi database

---

**Dibuat dengan ❤️ untuk pendidikan Indonesia**