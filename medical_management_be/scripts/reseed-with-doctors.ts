import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reseedWithDoctors() {
  console.log('🚀 Bắt đầu reseed database với bác sĩ điều trị...');

  try {
    // 1. Chạy seed mới
    console.log('📦 Chạy seed database...');
    execSync('npx prisma db seed', { stdio: 'inherit' });

    // 2. Kiểm tra kết quả
    console.log('\n🔍 Kiểm tra kết quả...');
    
    const doctors = await prisma.user.count({
      where: {
        role: 'DOCTOR',
        deletedAt: null
      }
    });

    const patients = await prisma.user.count({
      where: {
        role: 'PATIENT',
        deletedAt: null
      }
    });

    const patientsWithDoctor = await prisma.user.count({
      where: {
        role: 'PATIENT',
        deletedAt: null,
        createdBy: { not: null }
      }
    });

    console.log(`\n📊 Kết quả seed:`);
    console.log(`- Bác sĩ: ${doctors}`);
    console.log(`- Bệnh nhân: ${patients}`);
    console.log(`- Bệnh nhân có bác sĩ điều trị: ${patientsWithDoctor}/${patients}`);

    if (patientsWithDoctor === patients) {
      console.log('✅ Thành công! Tất cả bệnh nhân đều có bác sĩ điều trị');
    } else {
      console.log('⚠️  Một số bệnh nhân vẫn chưa có bác sĩ điều trị');
    }

    // 3. Hiển thị mẫu dữ liệu
    console.log('\n👨‍⚕️ Mẫu bác sĩ:');
    const sampleDoctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        deletedAt: null
      },
      select: {
        fullName: true,
        majorDoctor: true
      },
      take: 3
    });

    sampleDoctors.forEach(doctor => {
      console.log(`- ${doctor.fullName} (${doctor.majorDoctor})`);
    });

    console.log('\n👥 Mẫu bệnh nhân với bác sĩ điều trị:');
    const samplePatients = await prisma.user.findMany({
      where: {
        role: 'PATIENT',
        deletedAt: null,
        createdBy: { not: null }
      },
      select: {
        fullName: true,
        createdByUser: {
          select: {
            fullName: true,
            majorDoctor: true
          }
        }
      },
      take: 3
    });

    samplePatients.forEach(patient => {
      console.log(`- ${patient.fullName} → BS. ${patient.createdByUser?.fullName} (${patient.createdByUser?.majorDoctor})`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi reseed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
reseedWithDoctors();
