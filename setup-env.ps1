# PowerShell script untuk setup environment dan jalankan Prisma commands
# Simpan sebagai setup-env.ps1

Write-Host "Setting up environment variables..." -ForegroundColor Green

# Set environment variables from .env.local
$env:DATABASE_URL = "postgresql://neondb_owner:npg_gG9uO2TiLMNl@ep-lucky-flower-a1j0dfic-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
$env:NEXTAUTH_URL = "http://localhost:3000"
$env:NEXTAUTH_SECRET = "super-secret-key-minimal-32-characters-untuk-keamanan-tinggi"

Write-Host "Environment variables set successfully!" -ForegroundColor Green

# Display menu
Write-Host "`n=== PRISMA DATABASE COMMANDS ===" -ForegroundColor Yellow
Write-Host "1. Generate Prisma Client"
Write-Host "2. Push Database Schema"
Write-Host "3. Open Prisma Studio"
Write-Host "4. Reset Database"
Write-Host "5. Run Development Server"
Write-Host "6. Exit"

$choice = Read-Host "`nSelect option (1-6)"

switch ($choice) {
    "1" { 
        Write-Host "Generating Prisma Client..." -ForegroundColor Blue
        npx prisma generate 
    }
    "2" { 
        Write-Host "Pushing Database Schema..." -ForegroundColor Blue
        npx prisma db push 
    }
    "3" { 
        Write-Host "Opening Prisma Studio..." -ForegroundColor Blue
        npx prisma studio 
    }
    "4" { 
        Write-Host "Resetting Database..." -ForegroundColor Red
        npx prisma db push --force-reset 
    }
    "5" { 
        Write-Host "Starting Development Server..." -ForegroundColor Blue
        npm run dev 
    }
    "6" { 
        Write-Host "Goodbye!" -ForegroundColor Green
        exit 
    }
    default { 
        Write-Host "Invalid option!" -ForegroundColor Red 
    }
}