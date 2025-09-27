import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const PaginationQuerySchema = z
  .object({
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val) => parseInt(val, 10)),
    limit: z
      .string()
      .optional()
      .default('10')
      .transform((val) => parseInt(val, 10)),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  })
  .refine((data) => data.page > 0, {
    message: 'Số trang phải lớn hơn 0',
    path: ['page']
  })
  .refine((data) => data.limit > 0 && data.limit <= 100, {
    message: 'Giới hạn phải từ 1 đến 100',
    path: ['limit']
  });

export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {}
