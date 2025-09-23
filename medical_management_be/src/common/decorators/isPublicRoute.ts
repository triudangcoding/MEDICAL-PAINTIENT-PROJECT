import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): CustomDecorator<string> =>
  SetMetadata(IS_PUBLIC_KEY, true);

export const IS_PUBLIC_PERMISSION = 'isPublicPermission';
export const SkipPermission = (): CustomDecorator<string> =>
  SetMetadata(IS_PUBLIC_PERMISSION, true);
