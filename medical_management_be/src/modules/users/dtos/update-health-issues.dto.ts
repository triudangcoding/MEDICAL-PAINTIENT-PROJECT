import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateExerciseVideosSchema = z
    .object({
        // Danh sách mã video bài tập
        exerciseVideoIds: z.array(z.string().min(1, {
            message: 'Mã video không được để trống'
        }).max(50, {
            message: 'Mã video không được quá 50 ký tự'
        }), {
            errorMap: () => ({ message: 'Danh sách mã video bài tập không hợp lệ' })
        }).optional(),
        
        // Thông tin vấn đề sức khỏe cơ bản
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
            // Ít nhất phải có một trường được cung cấp
            return data.exerciseVideoIds !== undefined || 
                   data.hasPsychologicalIssues !== undefined || 
                   data.hasNutritionalIssues !== undefined;
        },
        {
            message: 'Cần cung cấp ít nhất một thông tin để cập nhật (exerciseVideoIds, hasPsychologicalIssues, hoặc hasNutritionalIssues)',
            path: ['root']
        }
    );

class UpdateHealthAndExerciseDto extends createZodDto(UpdateExerciseVideosSchema) { }

export default UpdateHealthAndExerciseDto; 