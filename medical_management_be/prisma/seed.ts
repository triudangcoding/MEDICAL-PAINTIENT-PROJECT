import { PrismaClient, UserRole, UserStatus, Gender, AdherenceStatus, AlertType, PrescriptionStatus, MajorDoctor } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = '123123';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const vnPrefixes = [
  '090','093','097','098','096',
  '091','094','088','086',
  '032','033','034','035','036','037','038','039',
  '070','079','077','076','078',
  '081','082','083','084','085'
];

const vnFirstNames = ['An','Anh','Bảo','Bình','Châu','Chi','Dương','Giang','Hà','Hải','Hằng','Hiếu','Hoa','Hoàng','Hùng','Hương','Khánh','Kiên','Lan','Linh','Long','Mai','Minh','My','Nam','Ngân','Ngọc','Nghĩa','Nhung','Phát','Phúc','Phương','Quân','Quang','Quỳnh','Sơn','Tâm','Tân','Thảo','Thành','Thắng','Thanh','Thảo','Thịnh','Thu','Thúy','Trang','Trinh','Trung','Tú','Tuấn','Tuyết','Vy','Yến'];
const vnLastNames = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Huỳnh','Phan','Vũ','Võ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý'];
const vnMiddleNames = ['Văn','Hữu','Thị','Ngọc','Quốc','Gia','Minh','Anh','Hoàng','Thanh','Đức','Xuân','Thuỳ','Phương','Hải','Bảo','Tuấn','Thảo'];

function generateVietnamPhone(index: number): string {
  const prefix = vnPrefixes[index % vnPrefixes.length];
  const tailNum = (1000000 + (index % 9000000)).toString().padStart(7, '0');
  return `${prefix}${tailNum}`;
}

function generateVietnamName(seed: number): string {
  const last = vnLastNames[seed % vnLastNames.length];
  const middle = vnMiddleNames[seed % vnMiddleNames.length];
  const first = vnFirstNames[seed % vnFirstNames.length];
  return `${last} ${middle} ${first}`;
}

async function upsertUser(params: {
  phoneNumber: string;
  password?: string;
  fullName: string;
  role: UserRole;
  status?: UserStatus;
  majorDoctor?: MajorDoctor;
  createdBy?: string;
}) {
  const passwordHash = await bcrypt.hash(params.password ?? DEFAULT_PASSWORD, 10);
  return prisma.user.upsert({
    where: { phoneNumber: params.phoneNumber },
    update: {},
    create: {
      phoneNumber: params.phoneNumber,
      password: passwordHash,
      fullName: params.fullName,
      role: params.role,
      status: params.status ?? UserStatus.ACTIVE,
      majorDoctor: params.majorDoctor,
      createdBy: params.createdBy
    }
  });
}

async function createMedications() {
  const meds = [
    { name: 'Paracetamol', strength: '500mg', form: 'tablet', unit: 'mg', description: 'Giảm đau hạ sốt', isActive: true },
    { name: 'Amoxicillin', strength: '500mg', form: 'capsule', unit: 'mg', description: 'Kháng sinh', isActive: true },
    { name: 'Metformin', strength: '500mg', form: 'tablet', unit: 'mg', description: 'Đái tháo đường', isActive: true },
    { name: 'Atorvastatin', strength: '20mg', form: 'tablet', unit: 'mg', description: 'Giảm mỡ máu', isActive: true },
    { name: 'Omeprazole', strength: '20mg', form: 'capsule', unit: 'mg', description: 'Trào ngược dạ dày', isActive: true },
    { name: 'Ibuprofen', strength: '400mg', form: 'tablet', unit: 'mg', description: 'Kháng viêm giảm đau', isActive: true },
    { name: 'Amlodipine', strength: '5mg', form: 'tablet', unit: 'mg', description: 'Huyết áp', isActive: true },
    { name: 'Losartan', strength: '50mg', form: 'tablet', unit: 'mg', description: 'Huyết áp', isActive: true },
    { name: 'Levothyroxine', strength: '50mcg', form: 'tablet', unit: 'mcg', description: 'Tuyến giáp', isActive: true },
    { name: 'Salbutamol', strength: '100mcg', form: 'inhaler', unit: 'mcg', description: 'Hen suyễn', isActive: true },
    { name: 'Azithromycin', strength: '500mg', form: 'tablet', unit: 'mg', description: 'Kháng sinh', isActive: true },
    { name: 'Vitamin D3', strength: '1000IU', form: 'tablet', unit: 'IU', description: 'Vitamin D', isActive: true },
    { name: 'Clopidogrel', strength: '75mg', form: 'tablet', unit: 'mg', description: 'Kháng kết tập tiểu cầu', isActive: true },
    { name: 'Aspirin', strength: '81mg', form: 'tablet', unit: 'mg', description: 'Chống đông liều thấp', isActive: true },
    { name: 'Gliclazide', strength: '30mg', form: 'tablet', unit: 'mg', description: 'Đái tháo đường', isActive: true },
    { name: 'Insulin Glargine', strength: '100IU/ml', form: 'pen', unit: 'IU/ml', description: 'Insulin nền', isActive: true },
    { name: 'Simvastatin', strength: '20mg', form: 'tablet', unit: 'mg', description: 'Statin', isActive: true },
    { name: 'Ranitidine', strength: '150mg', form: 'tablet', unit: 'mg', description: 'Dạ dày', isActive: true },
    { name: 'Ciprofloxacin', strength: '500mg', form: 'tablet', unit: 'mg', description: 'Kháng sinh quinolone', isActive: true },
    { name: 'Prednisone', strength: '5mg', form: 'tablet', unit: 'mg', description: 'Corticoid', isActive: true }
  ];

  const created = [] as Array<{ id: string; name: string }>;
  for (const m of meds) {
    const existed = await prisma.medication.findFirst({ where: { name: m.name } });
    const med = existed ?? (await prisma.medication.create({ data: m }));
    created.push({ id: med.id, name: med.name });
  }
  return created;
}

async function createPatientDetails(patientId: string) {
  await prisma.patientProfile.upsert({
    where: { userId: patientId },
    update: {},
    create: {
      userId: patientId,
      gender: pickOne([Gender.MALE, Gender.FEMALE, Gender.OTHER]),
      birthDate: new Date(1990, randomInt(0, 11), randomInt(1, 28)),
      address: `Số ${randomInt(1, 200)} Đường ABC, Q.${randomInt(1, 12)}, TP.HCM`
    }
  });

  await prisma.patientMedicalHistory.upsert({
    where: { patientId },
    update: {},
    create: {
      patientId,
      conditions: pickOne([['Tăng huyết áp'], ['Đái tháo đường'], []]),
      allergies: pickOne([['Penicillin'], ['Hải sản'], []]),
      surgeries: pickOne([['Cắt ruột thừa'], []]),
      familyHistory: pickOne(['Không', 'Gia đình có tăng huyết áp', 'Gia đình có đái tháo đường']),
      lifestyle: pickOne(['Hút thuốc', 'Không hút thuốc', 'Uống rượu xã giao']),
      currentMedications: [],
      notes: pickOne(['', 'Cần theo dõi thêm', 'Ổn định'])
    }
  });
}

async function cleanupAll() {
  // Order matters due to FKs
  await prisma.alert.deleteMany({});
  await prisma.adherenceLog.deleteMany({});
  await prisma.prescriptionItem.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.patientMedicalHistory.deleteMany({});
  await prisma.patientProfile.deleteMany({});
  await prisma.medication.deleteMany({});
  await prisma.user.deleteMany({});
}

async function seed() {
  console.log('Seeding database...');

  await cleanupAll();

  // 1) Users
  await upsertUser({
    phoneNumber: generateVietnamPhone(0),
    fullName: 'Quản trị Hệ thống',
    role: UserRole.ADMIN
  });

  const majorDoctors = Object.values(MajorDoctor);
  const doctors: Array<{ id: string; fullName: string }> = [];
  for (let i = 1; i <= 10; i++) {
    const d = await upsertUser({
      phoneNumber: generateVietnamPhone(i),
      fullName: `BS. ${generateVietnamName(i)}`,
      role: UserRole.DOCTOR,
      majorDoctor: majorDoctors[i % majorDoctors.length]
    });
    doctors.push({ id: d.id, fullName: d.fullName });
  }

  const patients: Array<{ id: string; fullName: string }> = [];
  for (let i = 1; i <= 20; i++) {
    // Gán bệnh nhân cho bác sĩ ngẫu nhiên
    const assignedDoctor = pickOne(doctors);
    const p = await upsertUser({
      phoneNumber: generateVietnamPhone(1000 + i),
      fullName: generateVietnamName(2000 + i),
      role: UserRole.PATIENT,
      createdBy: assignedDoctor.id
    });
    patients.push({ id: p.id, fullName: p.fullName });
    await createPatientDetails(p.id);
  }

  // 2) Medications
  const medications = await createMedications();

  // 3) Prescriptions + Items (per patient)
  const prescriptions: string[] = [];
  for (const patient of patients) {
    const count = randomInt(2, 4);
    for (let k = 0; k < count; k++) {
      const doctor = pickOne(doctors);
      const prescription = await prisma.prescription.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          status: pickOne([PrescriptionStatus.ACTIVE, PrescriptionStatus.ACTIVE, PrescriptionStatus.COMPLETED]),
          startDate: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000),
          notes: pickOne(['', 'Uống sau ăn', 'Tránh rượu bia'])
        }
      });
      prescriptions.push(prescription.id);

      const numItems = randomInt(1, 3);
      for (let j = 0; j < numItems; j++) {
        const med = pickOne(medications);
        await prisma.prescriptionItem.create({
          data: {
            prescriptionId: prescription.id,
            medicationId: med.id,
            dosage: pickOne(['1 viên', '2 viên', '5ml']),
            frequencyPerDay: pickOne([1, 2, 3]),
            timesOfDay: pickOne([
              ['08:00'],
              ['08:00', '20:00'],
              ['08:00', '14:00', '20:00']
            ]),
            durationDays: pickOne([7, 10, 14, 30]),
            route: pickOne(['uống', 'bôi', 'hít']),
            instructions: pickOne(['', 'Sau ăn', 'Trước khi ngủ'])
          }
        });
      }
    }
  }

  // 4) Adherence logs
  for (const pid of prescriptions) {
    const parent = await prisma.prescription.findUnique({ where: { id: pid } });
    if (!parent) continue;

    const items = await prisma.prescriptionItem.findMany({ where: { prescriptionId: pid } });
    const patientId = parent.patientId;
    const chosenItem = items.length ? pickOne(items) : undefined;
    const baseDate = new Date();

    const logCount = randomInt(6, 12);
    for (let i = 0; i < logCount; i++) {
      const status = pickOne([AdherenceStatus.TAKEN, AdherenceStatus.MISSED, AdherenceStatus.TAKEN, AdherenceStatus.SKIPPED]);
      const offsetH = -1 * randomInt(1, 168); // within ~1 week
      await prisma.adherenceLog.create({
        data: {
          prescriptionId: pid,
          prescriptionItemId: chosenItem?.id ?? null,
          patientId,
          takenAt: new Date(baseDate.getTime() + offsetH * 60 * 60 * 1000),
          status,
          amount: null,
          notes: status === AdherenceStatus.MISSED ? 'Bỏ liều' : null
        }
      });
    }
  }

  // 5) Alerts
  for (const pid of prescriptions) {
    const parent = await prisma.prescription.findUnique({ where: { id: pid } });
    if (!parent) continue;

    const missedCount = await prisma.adherenceLog.count({ where: { prescriptionId: pid, status: AdherenceStatus.MISSED } });
    if (missedCount >= 2) {
      await prisma.alert.create({
        data: {
          prescriptionId: pid,
          patientId: parent.patientId,
          doctorId: parent.doctorId,
          type: missedCount > 4 ? AlertType.LOW_ADHERENCE : AlertType.MISSED_DOSE,
          message: missedCount > 4 ? 'Tỉ lệ tuân thủ thấp trong thời gian gần đây' : 'Phát hiện bỏ liều',
          resolved: false
        }
      });
    }
  }

  console.log('Seeding done.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
