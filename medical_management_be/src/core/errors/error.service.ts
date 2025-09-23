import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZodError } from 'zod';
import * as _ from 'lodash';
import {
  IErrorResponse,
  IZodValidationError,
  formatZodError
} from '@/common/types/exception.types';

@Injectable()
export class ErrorService {
  constructor(private readonly configService: ConfigService) {}

  formatErrorResponse(errorCode: string, message: string): IErrorResponse {
    return {
      statusCode: parseInt(errorCode.substring(errorCode.lastIndexOf('-') + 1)),
      error: this.getErrorName(errorCode),
      message,
      timestamp: new Date().toISOString()
    };
  }

  formatMessage(err: any, stackTrace?: any): IErrorResponse {
    console.error(err);
    const message = _.isArray(err?.message)
      ? err.message[0]
      : err?.message || 'Unknown error';

    const errorType = err?.error || 'Unknown Error';
    const statusCode = err?.statusCode || 500;

    switch (errorType) {
      case 'Bad Request':
        return this.createErrorResponse(statusCode, errorType, message);
      case 'Forbidden':
        return this.createErrorResponse(statusCode, errorType, message);
      case 'Internal Server Error':
        return this.createErrorResponseWithDetails(
          statusCode,
          errorType,
          message,
          stackTrace
        );
      case 'Not Found':
        return this.createErrorResponse(statusCode, errorType, message);
      case 'Unauthorized':
        return this.createErrorResponse(statusCode, errorType, message);
      case 'Unprocessable Entity':
        return this.handleZodValidationErrors(err);
      default:
        return this.createErrorResponse(statusCode, errorType, message);
    }
  }

  handleZodValidation(error: ZodError): IErrorResponse {
    const validationErrors = formatZodError(error);
    return this.createErrorResponse(
      400,
      'Validation Error',
      'Invalid input data',
      validationErrors
    );
  }

  private handleZodValidationErrors(error: any): IErrorResponse {
    let validationErrors: IZodValidationError[] = [];

    if (error instanceof ZodError) {
      validationErrors = formatZodError(error);
    } else if (error.message && Array.isArray(error.message)) {
      validationErrors = error.message.map((err) => ({
        field: err.field || 'unknown',
        message: err.message || 'Invalid value'
      }));
    }

    return this.createErrorResponse(
      400,
      'Validation Error',
      'Invalid input data',
      validationErrors
    );
  }

  formatPrismaError(
    errorCode: string,
    errorName: string,
    clientVersion?: string
  ): IErrorResponse {
    return {
      statusCode: 400,
      error: errorName,
      message: this.getPrismaErrorMessage(errorCode),
      timestamp: new Date().toISOString(),
      details: clientVersion ? { client_version: clientVersion } : undefined
    };
  }

  private createErrorResponse(
    statusCode: number,
    error: string,
    message: string,
    errors: any[] = []
  ): IErrorResponse {
    return {
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
      ...(errors.length > 0 && { details: errors })
    };
  }

  private createErrorResponseWithDetails(
    statusCode: number,
    error: string,
    message: string,
    details: any
  ): IErrorResponse {
    return {
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
      details
    };
  }

  private getErrorName(errorCode: string): string {
    const errorMap = {
      'ERR-400': 'Bad Request',
      'ERR-401': 'Unauthorized',
      'ERR-403': 'Forbidden',
      'ERR-404': 'Not Found',
      'ERR-409': 'Conflict',
      'ERR-422': 'Unprocessable Entity',
      'ERR-500': 'Internal Server Error',
      'ERR-502': 'Bad Gateway',
      'PRISMA-100': 'Prisma Validation Error',
      'PRISMA-103': 'Prisma Initialization Error',
      'PRISMA-104': 'Prisma Unknown Request Error',
      'PRISMA-105': 'Prisma Rust Panic Error'
    };

    return errorMap[errorCode] || 'Unknown Error';
  }

  private getPrismaErrorMessage(errorCode: string): string {
    const messageMap = {
      'PRISMA-100': 'Database validation error occurred',
      'PRISMA-103': 'Failed to initialize database connection',
      'PRISMA-104': 'Unknown database request error',
      'PRISMA-105': 'Critical database error occurred'
    };

    return messageMap[errorCode] || 'Unknown database error';
  }
}
