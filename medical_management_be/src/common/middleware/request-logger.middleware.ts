import { Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

export const RequestLoggerMiddleWare = (
  req: FastifyRequest,
  res: FastifyReply,
  next: () => void
): void => {
  const logger = new Logger('RequestLogger');
  const { method, url } = req;
  // logger.verbose(`Request: ${method} ${url}}`)
  logger.debug('All headers:', JSON.stringify(req.headers));
  next();
};
