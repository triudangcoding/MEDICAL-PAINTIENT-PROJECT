import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function assignPatientsToDoctors() {
  console.log('🔄 Bắt đầu gán bệnh nhân cho bác sĩ...');

  try {
    // Lấy danh sách bác sĩ
    const doctors = await prisma.user.findMany({
      where: {
        role: UserRole.DOCTOR,
        deletedAt: null
      },
      select: {
        id: true,
        fullName: true,
        majorDoctor: true
      }
    });

    if (doctors.length === 0) {
      console.log('❌ Không tìm thấy bác sĩ nào trong hệ thống');
      return;
    }

    console.log(`📋 Tìm thấy ${doctors.length} bác sĩ`);

    // Lấy danh sách bệnh nhân chưa có bác sĩ điều trị
    const patientsWithoutDoctor = await prisma.user.findMany({
      where: {
        role: UserRole.PATIENT,
        deletedAt: null,
        createdBy: null
      },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true
      }
    });

    if (patientsWithoutDoctor.length === 0) {
      console.log('✅ Tất cả bệnh nhân đã có bác sĩ điều trị');
      return;
    }

    console.log(`👥 Tìm thấy ${patientsWithoutDoctor.length} bệnh nhân chưa có bác sĩ điều trị`);

    // Gán bệnh nhân cho bác sĩ
    let assignedCount = 0;
    for (const patient of patientsWithoutDoctor) {
      // Chọn bác sĩ ngẫu nhiên
      const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
      
      await prisma.user.update({
        where: { id: patient.id },
        data: { createdBy: randomDoctor.id }
      });

      assignedCount++;
      console.log(`✅ Gán bệnh nhân "${patient.fullName}" cho bác sĩ "${randomDoctor.fullName}"`);
    }

    console.log(`🎉 Hoàn thành! Đã gán ${assignedCount} bệnh nhân cho bác sĩ`);

    // Hiển thị thống kê
    const stats = await prisma.user.groupBy({
      by: ['role'],
      where: {
        deletedAt: null
      },
      _count: {
        id: true
      }
    });

    console.log('\n📊 Thống kê sau khi cập nhật:');
    stats.forEach(stat => {
      console.log(`- ${stat.role}: ${stat._count.id} người dùng`);
    });

    // Thống kê bệnh nhân có bác sĩ điều trị
    const patientsWithDoctor = await prisma.user.count({
      where: {
        role: UserRole.PATIENT,
        deletedAt: null,
        createdBy: { not: null }
      }
    });

    const totalPatients = await prisma.user.count({
      where: {
        role: UserRole.PATIENT,
        deletedAt: null
      }
    });

    console.log(`\n👨‍⚕️ Bệnh nhân có bác sĩ điều trị: ${patientsWithDoctor}/${totalPatients}`);

  } catch (error) {
    console.error('❌ Lỗi khi gán bệnh nhân cho bác sĩ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
assignPatientsToDoctors();
