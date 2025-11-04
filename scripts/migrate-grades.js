const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateGrades() {
  console.log('Starting grade migration...');
  
  try {
    // Pindahkan data lama ke kolom baru
    const result = await prisma.$executeRaw`
      UPDATE "Grade" 
      SET 
        "tugasHarian" = "tugas",
        "ulanganTengahSemester" = "ulangan"
      WHERE "tugas" IS NOT NULL OR "ulangan" IS NOT NULL
    `;
    
    console.log(`Migrated ${result} grade records`);
    
    // Verifikasi migrasi
    const grades = await prisma.grade.findMany({
      where: {
        OR: [
          { tugas: { not: null } },
          { ulangan: { not: null } }
        ]
      },
      select: {
        id: true,
        tugas: true,
        ulangan: true,
        tugasHarian: true,
        ulanganTengahSemester: true,
        student: {
          select: { name: true }
        }
      }
    });
    
    console.log('Verification - Grades after migration:', grades);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateGrades();