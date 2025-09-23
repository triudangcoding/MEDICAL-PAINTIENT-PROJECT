import { registerAs } from '@nestjs/config';
import validateConfig from 'src/utils/validateConfig.utils';
import { z } from 'zod';

const envSchema = z.object({
  JWT_ACCESS_TOKEN_SECRET_KEY: z.string(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.string(),
  JWT_REFRESH_TOKEN_SECRET_KEY: z.string(),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: z.string(),
  COOKIE_SECRET: z.string(),
  JWT_VERIFY_TOKEN_SECRET_KEY: z.string(),
  JWT_VERIFY_TOKEN_EXPIRATION_TIME: z.string(),
  SMS_USERS_KEY: z.string(),
  SMS_PASS_SECRET: z.string(),
  SMS_BRANDNAME: z.string(),
  SMS_ISUNICODE: z.string(),
  SMS_HOST: z.string()
});

export default registerAs('auth', () => {
  const env = validateConfig(process.env, envSchema);

  return {
    accessTokenSecret: env.JWT_ACCESS_TOKEN_SECRET_KEY,
    accessTokenExpiresIn: env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    refreshTokenSecret: env.JWT_REFRESH_TOKEN_SECRET_KEY,
    refreshTokenExpiresIn: env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    cookieSecret: env.COOKIE_SECRET,
    verifyTokenSecret: env.JWT_VERIFY_TOKEN_SECRET_KEY,
    verifyTokenExpiresIn: env.JWT_VERIFY_TOKEN_EXPIRATION_TIME,
    smsUsersKey: env.SMS_USERS_KEY,
    smsHost: env.SMS_HOST,
    smsPassSecret: env.SMS_PASS_SECRET,
    smsBrandName: env.SMS_BRANDNAME,
    smsIsUnicode: env.SMS_ISUNICODE,
  };
});
