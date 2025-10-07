import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  console.log('🔍 Kiểm tra dữ liệu sau khi seed...');

  try {
    // 1. Kiểm tra tổng số users
    const totalUsers = await prisma.user.count({
      where: { deletedAt: null }
    });

    const doctors = await prisma.user.count({
      where: { 
        role: UserRole.DOCTOR,
        deletedAt: null 
      }
    });

    const patients = await prisma.user.count({
      where: { 
        role: UserRole.PATIENT,
        deletedAt: null 
      }
    });

    console.log(`\n📊 Tổng quan:`);
    console.log(`- Tổng users: ${totalUsers}`);
    console.log(`- Bác sĩ: ${doctors}`);
    console.log(`- Bệnh nhân: ${patients}`);

    // 2. Kiểm tra bệnh nhân có bác sĩ điều trị
    const patientsWithDoctor = await prisma.user.count({
      where: {
        role: UserRole.PATIENT,
        deletedAt: null,
        createdBy: { not: null }
      }
    });

    const patientsWithoutDoctor = await prisma.user.count({
      where: {
        role: UserRole.PATIENT,
        deletedAt: null,
        createdBy: null
      }
    });

    console.log(`\n👨‍⚕️ Bệnh nhân và bác sĩ điều trị:`);
    console.log(`- Có bác sĩ điều trị: ${patientsWithDoctor}`);
    console.log(`- Chưa có bác sĩ điều trị: ${patientsWithoutDoctor}`);

    // 3. Kiểm tra mẫu dữ liệu với createdByUser
    console.log(`\n🔍 Mẫu dữ liệu với createdByUser relation:`);
    
    const samplePatients = await prisma.user.findMany({
      where: {
        role: UserRole.PATIENT,
        deletedAt: null,
        createdBy: { not: null }
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            majorDoctor: true,
            role: true
          }
        }
      },
      take: 5
    });

    samplePatients.forEach((patient, index) => {
      console.log(`\n${index + 1}. Bệnh nhân: ${patient.fullName}`);
      console.log(`   - ID: ${patient.id}`);
      console.log(`   - createdBy: ${patient.createdBy}`);
      console.log(`   - createdByUser: ${patient.createdByUser ? '✅ Có data' : '❌ Null'}`);
      
      if (patient.createdByUser) {
        console.log(`   - Bác sĩ: ${patient.createdByUser.fullName}`);
        console.log(`   - Chuyên khoa: ${patient.createdByUser.majorDoctor}`);
        console.log(`   - Role: ${patient.createdByUser.role}`);
      }
    });

    // 4. Kiểm tra API response structure
    console.log(`\n📡 Test API response structure:`);
    
    const apiTestData = await prisma.user.findMany({
      where: {
        role: UserRole.PATIENT,
        deletedAt: null
      },
      include: {
        profile: true,
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            majorDoctor: true,
            role: true
          }
        }
      },
      take: 2
    });

    console.log('Mẫu response từ API:');
    apiTestData.forEach((patient, index) => {
      console.log(`\nPatient ${index + 1}:`);
      console.log(JSON.stringify({
        id: patient.id,
        fullName: patient.fullName,
        phoneNumber: patient.phoneNumber,
        role: patient.role,
        createdBy: patient.createdBy,
        createdByUser: patient.createdByUser,
        profile: patient.profile ? {
          gender: patient.profile.gender,
          birthDate: patient.profile.birthDate,
          address: patient.profile.address
        } : null
      }, null, 2));
    });

    // 5. Kết luận
    console.log(`\n🎯 Kết luận:`);
    if (patientsWithDoctor === patients && patientsWithoutDoctor === 0) {
      console.log('✅ THÀNH CÔNG: Tất cả bệnh nhân đều có bác sĩ điều trị');
      console.log('✅ API sẽ trả về createdByUser với thông tin bác sĩ');
      console.log('✅ UI sẽ hiển thị tên bác sĩ và chuyên khoa');
    } else {
      console.log('❌ VẪN CÒN VẤN ĐỀ: Một số bệnh nhân chưa có bác sĩ điều trị');
    }

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra dữ liệu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
verifyData();
