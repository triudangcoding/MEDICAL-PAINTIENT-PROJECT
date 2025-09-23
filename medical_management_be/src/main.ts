import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Utils } from '@/utils/utils';
import multipart from '@fastify/multipart';

let app: NestFastifyApplication;

async function bootstrap() {
  try {
    app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter()
    );

    app.useGlobalPipes(new ValidationPipe());

    // Register multipart plugin
    await app.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
      }
    });

    // Serve static files
    app.register(require('@fastify/static'), {
      root: join(__dirname, '..', 'uploads'),
      prefix: '/uploads/'
    });

    app.setGlobalPrefix('/api');

    Utils.SystemUtils.setupCors(app);
    await Utils.SystemUtils.setupPipeline(app);

    const port = process.env.PORT || 9944;
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

bootstrap();
