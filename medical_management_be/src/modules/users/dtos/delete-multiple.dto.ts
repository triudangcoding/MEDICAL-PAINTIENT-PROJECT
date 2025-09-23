import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const DeleteMultiplePatientsSchema = z
    .object({
        ids: z.array(z.string().uuid('ID phải là UUID hợp lệ'))
            .min(1, 'Danh sách ID không được để trống')
            .max(50, 'Không thể xóa quá 50 người dùng cùng lúc')
    })
    .strict();

export class DeleteMultiplePatientsDto extends createZodDto(DeleteMultiplePatientsSchema) {}

export default DeleteMultiplePatientsDto; 