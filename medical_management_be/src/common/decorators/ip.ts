import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import requestIp from 'request-ip';

export const IpTracking = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const clientIp = requestIp.getClientIp(request);
    return (
      clientIp ||
      request.headers['x-forwarded-for'] ||
      request.socket.remoteAddress
    );
  }
);
