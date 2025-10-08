import { ErrorService } from '@/core/errors/error.service';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from 'src/core/database/database.module';
import appConfig from 'src/core/configs/app.config';
import { LoggerModule } from './logger/logger.module';
import authConfig from '@/core/auth/config/auth.config';
import { AuthModule } from '@/core/auth/auth.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';
// Removed Redis queues, BullMQ, Bull Board, and Email service in simplified setup

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig],
      envFilePath: ['.env']
    }),
    LoggerModule,
    DatabaseModule,
    AuthModule
  ],
  providers: [
    ErrorService,
    // Temporarily disabled global pipe for debugging
    // {
    //   provide: APP_PIPE,
    //   useClass: ZodValidationPipe
    // }
  ],
  exports: [ErrorService, LoggerModule, DatabaseModule, AuthModule]
})
export class CoreModule {}
