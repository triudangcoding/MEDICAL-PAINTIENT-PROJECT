import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CollectUserInfoSchema = z
    .object({
        fullName: z.string().min(1, { message: 'Họ tên không được để trống' }),
        gender: z.enum(['NAM', 'NU'], {
            errorMap: () => ({ message: 'Giới tính phải là NAM hoặc NU' })
        }),
        birthYear: z.number().int().min(1900, { message: 'Năm sinh không hợp lệ' }).max(new Date().getFullYear(), { message: 'Năm sinh không được lớn hơn năm hiện tại' }),
        livingArea: z.enum(['NONG_THON', 'THANH_THI'], {
            errorMap: () => ({ message: 'Nơi sinh sống không hợp lệ' })
        }),
        specificAddress: z.string().min(1, { message: 'Địa chỉ cụ thể không được để trống' }),
        educationLevel: z.enum(['CAP_1', 'CAP_2', 'CAP_3', 'DAI_HOC_CAO_DANG', 'SAU_DAI_HOC'], {
            errorMap: () => ({ message: 'Trình độ văn hóa không hợp lệ' })
        }),
        maritalStatus: z.enum(['DA_KET_HON', 'DOC_THAN', 'LY_THAN_LY_DI', 'GOA', 'SONG_CHUNG_KHONG_KET_HON'], {
            errorMap: () => ({ message: 'Tình trạng hôn nhân không hợp lệ' })
        }),
        occupation: z.enum(['NONG_DAN', 'CONG_NHAN', 'GIAO_VIEN', 'CAN_BO_CONG_NHAN_VIEN_CHUC', 'CONG_AN_BO_DOI', 'BUON_BAN_KINH_DOANH', 'KHAC'], {
            errorMap: () => ({ message: 'Nghề nghiệp không hợp lệ' })
        }),
        occupationOther: z.string().optional().default(''),
        isWorking: z.enum(['CO', 'KHONG'], {
            errorMap: () => ({ message: 'Trạng thái đi làm không hợp lệ' })
        }),
        hasInsurance: z.enum(['CO', 'KHONG'], {
            errorMap: () => ({ message: 'Trạng thái BHYT không hợp lệ' })
        }),
        insuranceCoverage: z.enum(['MUOI_PHAN_TRAM', 'TAM_MUOI_PHAN_TRAM', 'CHIN_MUOI_LAM_PHAN_TRAM', 'MOT_TRAM_PHAN_TRAM', 'KHONG'], {
            errorMap: () => ({ message: 'Mức bảo hiểm chi trả không hợp lệ' })
        }).optional().default('KHONG'),
        hasChronicDisease: z.enum(['CO', 'KHONG'], {
            errorMap: () => ({ message: 'Trạng thái bệnh nền không hợp lệ' })
        }),
        cancerType: z.enum(['VU', 'BUONG_TRUNG'], {
            errorMap: () => ({ message: 'Loại ung thư không hợp lệ' })
        }),
        diagnosisMonthsAgo: z.number().int().min(0, { message: 'Thời gian chẩn đoán không hợp lệ' }),
        cancerStage: z.enum(['GIAI_DOAN_1', 'GIAI_DOAN_2', 'GIAI_DOAN_3', 'GIAI_DOAN_4', 'TAI_PHAT'], {
            errorMap: () => ({ message: 'Giai đoạn bệnh không hợp lệ' })
        }),
        pastTreatmentMethod: z.enum(['PHAU_THUAT', 'XA_TRI', 'HOA_TRI', 'KHAC'], {
            errorMap: () => ({ message: 'Phương pháp điều trị đã qua không hợp lệ' })
        }),
        pastTreatmentOther: z.string().optional().default(''),
        currentTreatmentMethod: z.enum(['PHAU_THUAT', 'XA_TRI', 'HOA_TRI', 'THUOC_DICH', 'THUOC_MIEN_DICH'], {
            errorMap: () => ({ message: 'Phương pháp điều trị hiện tại không hợp lệ' })
        }),
        currentTreatmentOther: z.string().optional().default(''),
        hospitalInfo: z.string().min(1, { message: 'Thông tin bệnh viện không được để trống' }),
        height: z.number().int().min(50, { message: 'Chiều cao không hợp lệ' }).max(250, { message: 'Chiều cao không hợp lệ' }),
        weight: z.number().int().min(20, { message: 'Cân nặng không hợp lệ' }).max(200, { message: 'Cân nặng không hợp lệ' }),
        
        // Danh sách mã video bài tập (optional)
        exerciseVideoIds: z.array(z.string().min(1, {
            message: 'Mã video không được để trống'
        }).max(50, {
            message: 'Mã video không được quá 50 ký tự'
        })).optional().default([]),
        
        // Thông tin vấn đề sức khỏe cơ bản (optional)
        hasPsychologicalIssues: z.enum(['CO', 'KHONG'], {
            errorMap: () => ({ message: 'Trạng thái vấn đề tâm lý không hợp lệ' })
        }).optional(),
        hasNutritionalIssues: z.enum(['CO', 'KHONG'], {
            errorMap: () => ({ message: 'Trạng thái vấn đề dinh dưỡng không hợp lệ' })
        }).optional()
    })
    .strict()
    .refine(
        (data) => {
            if (data.occupation === 'KHAC' && !data.occupationOther) {
                return false;
            }
            return true;
        },
        {
            message: 'Vui lòng nhập nghề nghiệp khác',
            path: ['occupationOther'],
        }
    )
    .refine(
        (data) => {
            if (data.pastTreatmentMethod === 'KHAC' && !data.pastTreatmentOther) {
                return false;
            }
            return true;
        },
        {
            message: 'Vui lòng nhập phương pháp điều trị đã qua khác',
            path: ['pastTreatmentOther'],
        }
    );

class CollectUserInfoDto extends createZodDto(CollectUserInfoSchema) { }

export default CollectUserInfoDto; 