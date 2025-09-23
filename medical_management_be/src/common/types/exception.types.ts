import { HttpStatus } from '@nestjs/common';
import { ZodError } from 'zod';

// Error response interface
export interface IErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  details?: any;
}

// Execution context parameters for exception handling
export interface IExecutionContextParams {
  status: HttpStatus;
  response: any;
  error?: string;
  errors?: any;
  stackTrace?: string;
}

// Prisma error details
export interface IPrismaErrorDetails {
  code: string;
  message: string;
}

// Exception types mapping
export interface IErrorException {
  BadRequestException: string;
  NotFoundException: string;
  UnauthorizedException: string;
  ForbiddenException: string;
  InternalServerErrorException: string;
  BadGateway: string;
  ConflictException: string;
}

// Zod validation error format
export interface IZodValidationError {
  field: string;
  message: string;
}

// Utility type to extract validation errors from Zod
export function formatZodError(error: ZodError): IZodValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message
  }));
}
