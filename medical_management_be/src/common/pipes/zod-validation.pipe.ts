import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    console.log('=== ZOD VALIDATION DEBUG ===');
    console.log('Schema name:', (this.schema as any)._def?.typeName || 'Unknown');
    console.log('Input value:', JSON.stringify(value, null, 2));
    console.log('Input type:', typeof value);
    console.log('Input keys:', Object.keys(value || {}));
    console.log('=== END ZOD VALIDATION DEBUG ===');
    
    try {
      return this.schema.parse(value);
    } catch (error) {
      console.error('=== ZOD VALIDATION ERROR ===');
      console.error('Error:', error);
      console.error('Error errors:', error.errors);
      console.error('=== END ZOD VALIDATION ERROR ===');
      
      throw new BadRequestException({
        message: 'Lỗi dữ liệu đầu vào',
        errors: error.errors
      });
    }
  }
}
