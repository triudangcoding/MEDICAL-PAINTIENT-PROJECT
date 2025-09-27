import { TransformInterceptor } from '@/common/interceptors/transformResponse.interceptor';
import { IpWhitelistMiddleware } from '@/common/middleware/ip.middleware';
import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import aqp from 'api-query-params';
import { compareSync, genSalt, hash } from 'bcryptjs';
import helmet from 'helmet';
import fastifyCookie from '@fastify/cookie';
import { ConfigService } from '@nestjs/config';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export class Utils {
  static CommonUtils = {
    delayFunc: <T>(ms: number): Promise<T> => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    filterObject: (obj: object, keysToRemove: string[]): any => {
      if (!obj || typeof obj !== 'object') {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map((item) =>
          Utils.CommonUtils.filterObject(item, keysToRemove)
        );
      }

      for (const key in obj) {
        if (keysToRemove.includes(key)) {
          delete obj[key];
        } else if (obj[key] && typeof obj[key] === 'object') {
          obj[key] = Utils.CommonUtils.filterObject(obj[key], keysToRemove);
        }
      }
      return obj;
    }
  };

  static QueryUtils = {
    resolveQueryString: (queryString: string) => {
      const { filter = {}, sort, population, limit } = aqp(queryString);
      const page = parseInt(filter.page as string, 10) || 1;
      const limitPage = limit || 10;
      const skip = (page - 1) * limitPage;
      const includePopulate = filter.includePopulate ?? false;
      const condition = filter.condition?.toUpperCase() === 'OR' ? 'OR' : 'AND';

      delete filter.page;
      delete filter.condition;
      delete filter.includePopulate;

      if (filter.isExactly) {
        Object.keys(filter).forEach((key) => {
          filter[key] = { contains: filter[key], mode: 'insensitive' };
        });
      }
      delete filter.isExactly;

      return {
        pagination: {
          currentPage: page,
          limit: limitPage,
          skip
        },
        filter,
        includePopulate,
        condition,
        sort,
        population
      };
    }
  };

  static HashUtils = {
    hashPassword: async (password: string): Promise<string> => {
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);
      return hashedPassword;
    },
    comparePassword: (password: string, hashedPassword: string): boolean => {
      const isMatch = compareSync(password, hashedPassword);
      return isMatch;
    }
  };

  static DateUtils = {
    caculateExpiredTime: (time: number | string): Date => {
      if (typeof time === 'number') {
        return new Date(Date.now() + time);
      }

      // Handle string format like '30d' for JWT expiration
      const match = time.match(/^(\d+)([smhdwMy])$/);
      if (!match) {
        throw new Error(
          'Invalid time format. Use format like "30d", "2h", etc.'
        );
      }

      const value = parseInt(match[1], 10);
      const unit = match[2];

      let milliseconds = 0;
      switch (unit) {
        case 's': // seconds
          milliseconds = value * 1000;
          break;
        case 'm': // minutes
          milliseconds = value * 60 * 1000;
          break;
        case 'h': // hours
          milliseconds = value * 60 * 60 * 1000;
          break;
        case 'd': // days
          milliseconds = value * 24 * 60 * 60 * 1000;
          break;
        case 'w': // weeks
          milliseconds = value * 7 * 24 * 60 * 60 * 1000;
          break;
        case 'M': // months (approximate)
          milliseconds = value * 30 * 24 * 60 * 60 * 1000;
          break;
        case 'y': // years (approximate)
          milliseconds = value * 365 * 24 * 60 * 60 * 1000;
          break;
        default:
          throw new Error('Invalid time unit. Use s, m, h, d, w, M, or y.');
      }

      return new Date(Date.now() + milliseconds);
    },
    formatToISO: (rawTime: string, isToISO: boolean = true): string | Date => {
      console.log('>> INPUT', rawTime);
      const [time, date] = rawTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      const [day, month, year] = date.split('/').map(Number);

      const dateObj = new Date(Date.UTC(year, month - 1, day, hours, minutes));

      console.log('>> OUTPUT', dateObj.toISOString());

      return isToISO ? dateObj.toISOString() : dateObj;
    },

    /**
     * Xử lý datetime với timezone Việt Nam (UTC+7)
     * @param dateInput - Input datetime string
     * @returns Date object đã xử lý timezone chính xác
     */
    parseWithVietnamTimezone: (dateInput: string): Date => {
      if (!dateInput) {
        throw new Error('Date input không được để trống');
      }

      // Nếu input đã có timezone info, sử dụng trực tiếp
      if (dateInput.includes('+') || dateInput.includes('Z')) {
        return new Date(dateInput);
      }

      // Nếu input là ISO string không có timezone, thêm UTC+7
      if (dateInput.includes('T')) {
        return new Date(dateInput + '+07:00');
      }

      // Nếu input không phải ISO format, coi như local time và chuyển về UTC+7
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        throw new Error(`Định dạng datetime không hợp lệ: ${dateInput}`);
      }

      return date;
    }
  };

  static SystemUtils = {
    setupCors: (app: NestFastifyApplication): void => {
      const configService = app.get<ConfigService>(ConfigService);
      const isDevelopment =
        configService.get<string>('NODE_ENV') === 'development';
      if (isDevelopment) {
        Logger.debug('CORS is enabled for all origins', 'CorsSetup');
        app.enableCors({
          origin: '*',
          credentials: true,
          methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
          allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'Access-Control-Allow-Origin',
            'params'
          ],
          exposedHeaders: ['Set-Cookie', 'Cross-Origin-Resource-Policy']
        });
      } else {
        Logger.debug('CORS is enabled for specific origins', 'CorsSetup');
        app.enableCors({
          origin: [],
          credentials: true,
          methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
          allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'Access-Control-Allow-Origin',
            'params'
          ],
          exposedHeaders: ['Set-Cookie', 'Cross-Origin-Resource-Policy']
        });
      }
    },
    setupPipeline: async (app: NestFastifyApplication) => {
      const reflector = app.get(Reflector);
      const configService = app.get<ConfigService>(ConfigService);
      const jwtService = app.get(JwtService);
      const port = configService.get<number>('globalAppConfig.port', 3000);
      app.useGlobalInterceptors(new TransformInterceptor(reflector));
      app.useGlobalGuards(new JwtAuthGuard(reflector, jwtService));
      app.use(helmet());
      app.use(new IpWhitelistMiddleware().use);
      await app.register(fastifyCookie, {
        secret: configService.get<string>('auth.cookieSecret')
      });
      // await app.listen(port, '0.0.0.0');
    }
    // setupBullMQ removed in simplified stack
  };
}
