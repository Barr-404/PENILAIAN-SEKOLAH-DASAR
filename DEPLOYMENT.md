# PANDUAN DEPLOYMENT - Sistem Penilaian Sekolah Dasar

## Prasyarat Instalasi

### 1. Install Node.js dan npm
Download dan install Node.js dari [nodejs.org](https://nodejs.org)
- Versi yang direkomendasikan: Node.js 18.x atau lebih baru
- npm akan terinstall otomatis dengan Node.js

Verifikasi instalasi:
```bash
node --version
npm --version
```

### 2. Install Git (opsional untuk deployment)
Download dari [git-scm.com](https://git-scm.com)

## Setup Lokal

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Buat file `.env.local` di root project:

```env
# Database PostgreSQL (Neon)
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-characters"
```

### 3. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema ke database
npx prisma db push
```

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka http://localhost:3000

## Deployment ke Vercel

### Metode 1: Via GitHub (Recommended)

1. **Push ke GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/sekolah-app.git
git push -u origin main
```

2. **Deploy di Vercel:**
- Kunjungi [vercel.com](https://vercel.com)
- Login dengan GitHub
- Klik "New Project"
- Import repository GitHub Anda
- Tambahkan environment variables di dashboard Vercel:
  - `DATABASE_URL`
  - `NEXTAUTH_URL` (https://your-domain.vercel.app)
  - `NEXTAUTH_SECRET`

### Metode 2: Vercel CLI

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login dan Deploy:**
```bash
vercel login
vercel
```

## Setup Database Production

### 1. Buat Database di Neon
- Kunjungi [neon.tech](https://neon.tech)
- Buat akun dan database baru
- Copy connection string

### 2. Update Environment Variables
Ganti `DATABASE_URL` dengan connection string dari Neon

### 3. Push Schema ke Production
```bash
npx prisma db push
```

## Konfigurasi Tambahan

### 1. Custom Domain (Opsional)
Di dashboard Vercel:
- Settings > Domains
- Tambahkan domain custom
- Update `NEXTAUTH_URL` dengan domain baru

### 2. Monitoring dan Logs
- Gunakan Vercel Analytics
- Monitor di dashboard Vercel

## Testing Deployment

### 1. Test Fitur-Fitur Utama:
- [ ] Register akun guru baru
- [ ] Login dengan akun yang dibuat
- [ ] Tambah mata pelajaran
- [ ] Tambah siswa ke mata pelajaran
- [ ] Input nilai siswa
- [ ] Export ke Excel
- [ ] Logout

### 2. Test Responsive Design:
- [ ] Desktop view
- [ ] Tablet view
- [ ] Mobile view

## Troubleshooting

### Error: Cannot connect to database
- Pastikan `DATABASE_URL` benar
- Cek koneksi internet
- Verifikasi database sudah aktif di Neon

### Error: NEXTAUTH_SECRET missing
- Pastikan `NEXTAUTH_SECRET` ada di environment variables
- Minimal 32 karakter untuk production

### Error: Module not found
```bash
# Clear node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors di Vercel
- Cek logs di dashboard Vercel
- Pastikan semua dependencies ada di package.json
- Verifikasi TypeScript errors

## Commands Berguna

```bash
# Development
npm run dev          # Jalankan dev server
npm run build        # Build production
npm run start        # Jalankan production build
npm run lint         # Check linting

# Database
npx prisma studio    # Buka database browser
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema ke database
npx prisma migrate dev # Create dan run migration

# Deployment
vercel               # Deploy ke Vercel
vercel --prod        # Deploy to production
vercel logs          # Lihat deployment logs
```

## File Penting

```
.env.local           # Environment variables (jangan commit!)
package.json         # Dependencies dan scripts
prisma/schema.prisma # Database schema
next.config.js       # Next.js configuration
tailwind.config.js   # Tailwind CSS configuration
```

## Backup dan Maintenance

### 1. Backup Database
Gunakan Neon dashboard untuk backup otomatis

### 2. Update Dependencies
```bash
npm audit           # Check vulnerabilities
npm update          # Update dependencies
```

### 3. Monitor Performance
- Gunakan Vercel Analytics
- Monitor database performance di Neon

---

**Selamat! Website Anda siap digunakan! 🎉**

Jika ada masalah, cek dokumentasi atau buat issue di repository.