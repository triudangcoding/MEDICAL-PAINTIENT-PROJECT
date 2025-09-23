import { IErrorException } from '@/common/types/exception.types';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { ZodError } from 'zod';

export type ErrorCode =
  | 'ERR-400' // Bad Request
  | 'ERR-401' // Unauthorized
  | 'ERR-403' // Forbidden
  | 'ERR-404' // Not Found
  | 'ERR-409' // Conflict
  | 'ERR-422' // Validation Error
  | 'ERR-500' // Internal Server Error
  | 'ERR-502' // Bad Gateway
  | string; // Custom error codes

@Injectable()
export class ExceptionErrorsHandler {
  private exceptionMap: Record<
    keyof IErrorException,
    new (message: string) => HttpException
  > = {
    BadRequestException: BadRequestException,
    NotFoundException: NotFoundException,
    UnauthorizedException: UnauthorizedException,
    ForbiddenException: ForbiddenException,
    InternalServerErrorException: InternalServerErrorException,
    BadGateway: BadGatewayException,
    ConflictException: ConflictException
  };

  constructor(
    private readonly type: keyof IErrorException,
    private readonly errorCode: ErrorCode,
    private readonly details?: any
  ) {
    this.throwException();
  }

  private throwException(): void {
    const ExceptionClass = this.exceptionMap[this.type];
    if (ExceptionClass) {
      throw new ExceptionClass(this.createErrorPayload());
    } else {
      throw new InternalServerErrorException('Unknown exception type');
    }
  }

  private createErrorPayload(): any {
    const payload = {
      statusCode: this.getStatusCodeFromErrorCode(),
      error: this.getErrorName(),
      message: this.getMessage(),
      timestamp: new Date().toISOString()
    };

    if (this.details) {
      return { ...payload, details: this.details };
    }

    return payload;
  }

  private getStatusCodeFromErrorCode(): number {
    if (this.errorCode.startsWith('ERR-')) {
      const statusCodeStr = this.errorCode.substring(4);
      const statusCode = parseInt(statusCodeStr, 10);
      return !isNaN(statusCode) ? statusCode : 500;
    }
    return 500;
  }

  private getErrorName(): string {
    const errorMap: Record<string, string> = {
      'ERR-400': 'Bad Request',
      'ERR-401': 'Unauthorized',
      'ERR-403': 'Forbidden',
      'ERR-404': 'Not Found',
      'ERR-409': 'Conflict',
      'ERR-422': 'Validation Error',
      'ERR-500': 'Internal Server Error',
      'ERR-502': 'Bad Gateway'
    };

    return errorMap[this.errorCode] || 'Application Error';
  }

  private getMessage(): string {
    // For validation errors with Zod
    if (this.details instanceof ZodError) {
      return 'Validation error';
    }

    // Default error messages based on error code
    const messageMap: Record<string, string> = {
      'ERR-400': 'The request could not be processed due to invalid data',
      'ERR-401': 'Authentication required to access this resource',
      'ERR-403': 'You do not have permission to access this resource',
      'ERR-404': 'The requested resource was not found',
      'ERR-409': 'The request could not be completed due to a conflict',
      'ERR-422': 'The request data failed validation',
      'ERR-500': 'An unexpected error occurred on the server',
      'ERR-502': 'Bad gateway error'
    };

    return messageMap[this.errorCode] || this.errorCode;
  }
}
