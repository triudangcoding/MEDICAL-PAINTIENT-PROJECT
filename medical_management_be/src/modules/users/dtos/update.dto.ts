import { UserRole, UserStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Regex cho số điện thoại Việt Nam (10-11 số, bắt đầu bằng 0)
const PHONE_REGEX = /^0[0-9]{9,10}$/;

const UpdateSchema = z
  .object({
    fullName: z.string().optional(),
    phoneNumber: z.string()
      .regex(PHONE_REGEX, 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại từ 10-11 số, bắt đầu bằng 0')
      .optional(),
    password: z.string().optional(),
    oldPassword: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional()
  })
  .strict()
  .refine(
    (data) => {
      // Nếu có thay đổi password thì phải có oldPassword
      if (data.password && !data.oldPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'Vui lòng nhập mật khẩu cũ khi thay đổi mật khẩu',
      path: ['oldPassword']
    }
  );

class UpdatePatientDto extends createZodDto(UpdateSchema) { }
class UpdateUserDto extends createZodDto(UpdateSchema) { }

export { UpdatePatientDto, UpdateUserDto };
