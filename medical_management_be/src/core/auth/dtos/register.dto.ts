import { UserRole } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const RegisterSchema = z
  .object({
    fullName: z.string(),
    phoneNumber: z.string(),
    password: z.string(),
    role: z.nativeEnum(UserRole).optional(),
    createdBy: z.string().optional()
  })
  .strict();

class RegisterDto extends createZodDto(RegisterSchema) {}

export default RegisterDto;
