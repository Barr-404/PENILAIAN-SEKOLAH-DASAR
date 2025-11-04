@echo off
chcp 65001 >nul
cls

REM Set environment variables dari .env.local
set "DATABASE_URL=postgresql://neondb_owner:npg_gG9uO2TiLMNl@ep-lucky-flower-a1j0dfic-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
set "NEXTAUTH_URL=http://localhost:3000"
set "NEXTAUTH_SECRET=super-secret-key-minimal-32-characters-untuk-keamanan-tinggi"

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║            SETUP SISTEM PENILAIAN SEKOLAH DASAR                 ║
echo ║                                                                  ║
echo ║  Website untuk guru sekolah dasar mengelola nilai siswa          ║
echo ║  Next.js 14 + PostgreSQL + Tailwind CSS                         ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

echo [STEP 1/5] Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js tidak ditemukan!
    echo.
    echo 📥 Silakan install Node.js terlebih dahulu:
    echo    1. Kunjungi: https://nodejs.org
    echo    2. Download versi LTS ^(Long Term Support^)
    echo    3. Jalankan installer dan ikuti instruksi
    echo    4. Restart Command Prompt dan jalankan script ini lagi
    echo.
    echo 💡 Tip: Pilih "Add to PATH" saat instalasi
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js terdeteksi: %NODE_VERSION%
)

echo.
echo [STEP 2/5] Installing dependencies...
echo 📦 Menginstall package yang diperlukan...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Gagal menginstall dependencies!
    echo 💡 Coba jalankan: npm cache clean --force
    echo    Kemudian jalankan script ini lagi
    pause
    exit /b 1
) else (
    echo ✅ Dependencies berhasil diinstall
)

echo.
echo [STEP 3/5] Generating Prisma client...
echo 🔧 Membuat Prisma client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Gagal generate Prisma client!
    pause
    exit /b 1
) else (
    echo ✅ Prisma client berhasil dibuat
)

echo.
echo [STEP 4/5] Setting up database...
echo 🗄️  Menyiapkan database PostgreSQL...
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Gagal setup database!
    echo.
    echo 🔍 Kemungkinan masalah:
    echo    - Koneksi internet bermasalah
    echo    - DATABASE_URL di .env.local salah
    echo    - Database Neon tidak aktif
    echo.
    echo 📝 Pastikan file .env.local berisi:
    echo    DATABASE_URL="postgresql://neondb_owner:..."
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Database berhasil disiapkan
)

echo.
echo [STEP 5/5] Starting development server...
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                     SETUP BERHASIL! 🎉                          ║
echo ║                                                                  ║
echo ║  Website akan terbuka di: http://localhost:3000                  ║
echo ║                                                                  ║
echo ║  Fitur yang tersedia:                                            ║
echo ║  ✅ Register/Login Guru                                          ║
echo ║  ✅ Manajemen Mata Pelajaran                                     ║
echo ║  ✅ Input Nilai Siswa                                            ║
echo ║  ✅ Export ke Excel                                              ║
echo ║                                                                  ║
echo ║  Tekan Ctrl+C untuk menghentikan server                         ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

timeout /t 3 >nul
start http://localhost:3000
call npm run dev