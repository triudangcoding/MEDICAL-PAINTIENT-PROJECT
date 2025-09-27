import { UserRole } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const RegisterSchema = z
  .object({
    fullName: z.string(),
    phoneNumber: z.string(),
    password: z.string()
  })
  .strict();

class RegisterDto extends createZodDto(RegisterSchema) {}

export default RegisterDto;
