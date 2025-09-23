import { Utils } from '@/utils/utils';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';

export interface Response {
  statusCode: number;
  message: string;
  data: any;
}

const DEFAULT_KEYS_TO_REMOVE = [
  'createdAt',
  'updatedAt',
  'deletedAt',
  'updatedBy',
  'createdBy',
  'password',
  'deletedBy'
];

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response> {
    const request = context.switchToHttp().getRequest();
    const skipTransform = this.reflector.get<boolean>(
      'skipTransform',
      context.getHandler()
    );

    if (skipTransform) {
      return next.handle();
    }

    const keepFields =
      this.reflector.get<string[] | undefined>(
        'response:keepFields',
        context.getHandler()
      ) || [];

    const keysToRemove = DEFAULT_KEYS_TO_REMOVE.filter(
      (key) => !keepFields.includes(key)
    );

    return next.handle().pipe(
      map((data) => ({
        message: data?.message,
        pagination: data?.pagination,
        data: Utils.CommonUtils.filterObject(data?.data || data, keysToRemove),
        statusCode: context.switchToHttp().getResponse().statusCode
      }))
    );
  }
}
