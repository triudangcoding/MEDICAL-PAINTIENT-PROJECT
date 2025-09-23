import { ZodSchema } from 'zod';

function validateConfig<T>(config: unknown, schema: ZodSchema<T>): T {
  try {
    return schema.parse(config);
  } catch (error) {
    throw new Error(`Configuration validation error: ${error.message}`);
  }
}

export default validateConfig;
