import { UserRole } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Regex cho số điện thoại Việt Nam (10-11 số, bắt đầu bằng 0)
const PHONE_REGEX = /^0[0-9]{9,10}$/;

const CreateSchema = z
  .object({
    role: z.nativeEnum(UserRole).default(UserRole.PATIENT),
    fullName: z.string().min(1, 'Họ tên không được để trống'),
    phoneNumber: z
      .string()
      .regex(
        PHONE_REGEX,
        'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại từ 10-11 số, bắt đầu bằng 0'
      ),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
  })
  .strict();

class CreateDto extends createZodDto(CreateSchema) {}

export default CreateDto;
