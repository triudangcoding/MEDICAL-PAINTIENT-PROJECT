import { registerAs } from '@nestjs/config';
import { EEnvironment, IAppConfig } from 'src/core/configs/config.i';
import validateConfig from 'src/utils/validateConfig.utils';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .nativeEnum(EEnvironment)
    .optional()
    .default(EEnvironment.Development),
  BACKEND_PORT: z.coerce.number().min(0).max(65535).optional(),
  FRONTEND_URL: z.string()
});

export default registerAs<IAppConfig>('globalAppConfig', () => {
  const env = validateConfig(process.env, envSchema);

  return {
    nodeEnv: env.NODE_ENV || EEnvironment.Development,
    port: env.BACKEND_PORT || 3000,
    frontendUrl: env.FRONTEND_URL || 'http://localhost:3000'
  };
});
