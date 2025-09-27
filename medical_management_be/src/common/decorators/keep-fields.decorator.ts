import { SetMetadata } from '@nestjs/common';

export const KEEP_FIELDS_META_KEY = 'response:keepFields';
export const KeepFields = (...fields: string[]) =>
  SetMetadata(KEEP_FIELDS_META_KEY, fields);
