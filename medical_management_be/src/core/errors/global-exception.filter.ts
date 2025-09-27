import { IExecutionContextParams } from '@/common/types/exception.types';
import { ErrorService } from '@/core/errors/error.service';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZodError } from 'zod';

// Type definition for Prisma error
interface PrismaError extends Error {
  clientVersion?: string;
  code?: string;
}

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionsFilter.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly errorService: ErrorService
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest();

    // Handling Zod validation errors
    if (exception instanceof ZodError) {
      this.handleZodValidationError(exception, res);
      return;
    }

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const errors = isHttpException ? exception.getResponse() : undefined;
    const stackTrace = exception instanceof Error ? exception.stack : undefined;

    const executeContextParams: IExecutionContextParams = {
      response: res,
      status,
      errors,
      stackTrace
    };

    // Handle based on exception type
    if (isHttpException) {
      this.handleHttpException(exception, executeContextParams);
    } else if (this.isPrismaException(exception)) {
      this.handlePrismaException(
        exception as PrismaError,
        executeContextParams
      );
    } else {
      this.handleGenericException(exception, executeContextParams);
    }
  }

  private handleZodValidationError(exception: ZodError, res: any): void {
    this.logger.error('Validation error', exception.message);
    res
      .status(HttpStatus.BAD_REQUEST)
      .json(this.errorService.handleZodValidation(exception));
  }

  private handleHttpException(
    exception: HttpException,
    ctx: IExecutionContextParams
  ): void {
    const { response, status, errors, stackTrace } = ctx;
    this.logger.error(exception.message);
    response
      .status(status)
      .json(this.errorService.formatMessage(errors, stackTrace));
  }

  private isPrismaException(exception: unknown): boolean {
    if (!(exception instanceof Error)) return false;

    // Check if the error has the common Prisma error properties
    return (
      'clientVersion' in exception &&
      typeof (exception as any).clientVersion === 'string'
    );
  }

  private handlePrismaException(
    exception: PrismaError,
    ctx: IExecutionContextParams
  ): void {
    const { response } = ctx;
    this.logger.error('Prisma exception', exception);

    const errorMapping: Record<string, { code: string; message: string }> = {
      PrismaClientValidationError: {
        code: 'PRISMA-100',
        message: 'Prisma validation error'
      },
      PrismaClientInitializationError: {
        code: 'PRISMA-103',
        message: 'Prisma initialization error'
      },
      PrismaClientUnknownRequestError: {
        code: 'PRISMA-104',
        message: 'Prisma unknown request error'
      },
      PrismaClientRustPanicError: {
        code: 'PRISMA-105',
        message: 'Prisma rust panic error'
      },
      PrismaClientKnownRequestError: {
        code: 'PRISMA-106',
        message: 'Prisma known request error'
      }
    };

    // Get error type name
    const errorName = exception.constructor.name;
    const errorDetails = errorMapping[errorName] || {
      code: 'UNKNOWN-100',
      message: 'Unknown Error'
    };

    const responsePayload = this.errorService.formatPrismaError(
      errorDetails.code,
      exception.name,
      exception.clientVersion
    );

    response.status(HttpStatus.BAD_REQUEST).json(responsePayload);
  }

  private handleGenericException(
    exception: unknown,
    ctx: IExecutionContextParams
  ): void {
    const { response } = ctx;
    this.logger.error('Generic exception', exception);

    const errorResponse = this.errorService.formatMessage(
      {
        error: 'Internal Server Error',
        message:
          exception instanceof Error
            ? exception.message
            : 'Unknown error occurred',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      },
      exception instanceof Error ? exception.stack : undefined
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}
