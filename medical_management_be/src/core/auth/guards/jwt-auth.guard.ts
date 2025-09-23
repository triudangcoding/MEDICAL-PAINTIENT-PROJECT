import { IS_PUBLIC_KEY } from '@/common/decorators/isPublicRoute';
import { ExceptionErrorsHandler } from '@/core/errors/handler.service';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Handle WebSocket connection
    if (context.getType() === 'ws') {
      try {
        const client = context.switchToWs().getClient();
        const data = context.switchToWs().getData();

        this.logger.debug('WebSocket connection data:', data);

        if (!data?.auth?.token) {
          this.logger.error('No token in WebSocket connection auth');
          return false;
        }

        // Handle both formats: with and without 'Bearer ' prefix
        const token = data.auth.token.startsWith('Bearer ')
          ? data.auth.token.replace('Bearer ', '')
          : data.auth.token;

        this.logger.debug('Processing token:', token);

        const decoded = this.jwtService.verify(token);
        this.logger.debug('Decoded token:', decoded);

        // Set user data in client
        client.data.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        };

        return true;
      } catch (error) {
        this.logger.error(
          'WebSocket token verification failed:',
          error.message
        );
        return false;
      }
    }

    // Handle HTTP requests
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    return true;
  }

  handleRequest(err: Error, user: any, info: any, context: ExecutionContext) {
    // Handle WebSocket connection
    if (context.getType() === 'ws') {
      if (err || !user) {
        this.logger.error(
          'WebSocket authentication failed:',
          err?.message || 'No user found'
        );
        throw new ExceptionErrorsHandler('UnauthorizedException', 'AUTH-112');
      }
      return user;
    }

    // Handle HTTP requests
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    if (err || !user) {
      this.logger.error(
        'Authentication failed:',
        err?.message || 'No user found'
      );
      throw new ExceptionErrorsHandler('UnauthorizedException', 'AUTH-112');
    }

    return user;
  }
}
