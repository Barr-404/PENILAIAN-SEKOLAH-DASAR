# Panduan Instalasi Node.js dan Setup Project

## Langkah 1: Install Node.js

1. Buka browser dan kunjungi: https://nodejs.org
2. Download versi **LTS (Long Term Support)** - yang direkomendasikan
3. Jalankan installer dan ikuti instruksi
4. Restart Command Prompt/PowerShell setelah instalasi selesai

## Langkah 2: Verifikasi Instalasi

Buka Command Prompt atau PowerShell baru dan jalankan:

```cmd
node --version
npm --version
```

Jika terlihat versi number (contoh: v18.17.0), maka instalasi berhasil.

## Langkah 3: Install Dependencies Project

```cmd
cd "D:\PROUDUK\Penilain sekolah dasar"
npm install
```

## Langkah 4: Setup Database

```cmd
npx prisma generate
npx prisma db push
```

## Langkah 5: Jalankan Project

```cmd
npm run dev
```

Buka browser dan kunjungi: http://localhost:3000

## Alternatif: Gunakan Script Otomatis

Setelah Node.js terinstall, jalankan:

```cmd
setup.bat
```

Script ini akan otomatis:
- Install dependencies
- Setup database  
- Jalankan development server

## Jika Ada Error

### Error: "npm is not recognized"
- Restart Command Prompt/PowerShell
- Pastikan Node.js terinstall dengan benar

### Error: "Cannot connect to database"
- Pastikan koneksi internet aktif
- Cek file .env.local sudah benar

### Error: TypeScript errors
- Jalankan: `npm install @types/react @types/node`
- Restart VS Code

## Support

Jika masih ada masalah, screenshot error dan tanyakan!