import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class IpWhitelistMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IpWhitelistMiddleware.name);
  private readonly isAllowLocalhost = process.env.ALLOW_IP_LOCALHOST === 'true';
  private readonly ipWhitelist: string[];
  private readonly frontendDomain: string;
  private readonly apiDomain: string;
  private readonly isDevelopment: boolean;

  constructor() {
    try {
      this.isDevelopment = process.env.NODE_ENV === 'development';

      const ipList = JSON.parse(process.env.IP_WHITELIST || '[]');
      if (!Array.isArray(ipList))
        throw new Error('IP_WHITELIST must be a JSON array');
      this.ipWhitelist = ipList
        .map((ip) => ip.trim())
        .filter((ip) => ip.length > 0);

      // Lấy domain config
      this.frontendDomain = process.env.FRONTEND_DOMAIN || 'xxx.com';
      this.apiDomain = process.env.API_DOMAIN || 'api.xxx.com';

      this.logger.debug(`Development mode: ${this.isDevelopment}`);
      this.logger.debug(`Loaded ${this.ipWhitelist.length} IPs to whitelist`);
      this.logger.debug(`Frontend domain: ${this.frontendDomain}`);
      this.logger.debug(`API domain: ${this.apiDomain}`);
    } catch (error) {
      this.logger.error('Failed to parse configuration:', error);
      this.ipWhitelist = [];
      this.isDevelopment = process.env.NODE_ENV === 'development';
    }
  }
  use = (req: FastifyRequest, res: FastifyReply, next: () => void): void => {
    // In development mode, bypass all checks
    if (this.isDevelopment) {
      this.logger.debug('Development mode: Bypassing IP and domain checks');
      return next();
    }

    const clientIp = this.getClientIp(req);
    const origin = (req.headers.origin || '').toLowerCase();
    const referer = (req.headers.referer || '').toLowerCase();
    const host = req.headers.host?.toLowerCase();

    this.logger.debug('Request details:', {
      clientIp,
      origin,
      referer,
      host,
      userAgent: req.headers['user-agent']
    });

    if (this.isRequestFromFrontend(origin, referer)) {
      this.logger.debug(
        `Allowing request from frontend domain: ${origin || referer}`
      );
      return next();
    }

    if (this.isIpAllowed(clientIp)) {
      this.logger.debug(`Allowing request from whitelisted IP: ${clientIp}`);
      return next();
    }

    const requestDetails = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      host,
      origin: origin || 'N/A',
      referer: referer || 'N/A',
      clientIp,
      headers: this.getFilteredHeaders(req.headers as Record<string, any>),
      queryParams: req.query,
      body: this.getFilteredBody(req.body || {}),
      reason: `Access denied: Only requests from ${this.frontendDomain} or whitelisted IPs are allowed`
    };

    this.writeBlockedRequestLog(requestDetails);
    this.logger.error('Access denied:', requestDetails);
    throw new ForbiddenException('Access denied: Request not allowed');
  };

  private writeBlockedRequestLog(requestDetails: any): void {
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'blocked-requests.log');

    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logEntry = `[${new Date().toISOString()}] Blocked Request:\n${JSON.stringify(requestDetails, null, 2)}\n\n`;
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      this.logger.error('Failed to write blocked request log:', error);
    }
  }
  private getClientIp(req: FastifyRequest): string {
    if (req.headers['x-real-ip']) {
      const ip = Array.isArray(req.headers['x-real-ip'])
        ? req.headers['x-real-ip'][0]
        : req.headers['x-real-ip'];
      if (ip) {
        return ip;
      }
    }

    if (req.headers['x-forwarded-for']) {
      const forwardedIps = Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for'];
      if (forwardedIps) {
        const ip = forwardedIps.split(',')[0].trim();
        if (ip) {
          return ip;
        }
      }
    }

    return req.ip || '';
  }

  private isIpAllowed(ip: string): boolean {
    const normalizedIp = ip
      .toLowerCase()
      .trim()
      .replace(/^::ffff:/, '');

    if (
      ['localhost', '127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(
        normalizedIp
      )
    ) {
      return this.isAllowLocalhost;
    }

    return this.ipWhitelist.some((allowedItem) => {
      if (allowedItem.includes('/')) {
        return this.isIpInSubnet(normalizedIp, allowedItem);
      }
      return normalizedIp === allowedItem.toLowerCase();
    });
  }

  private isIpInSubnet(ip: string, subnet: string): boolean {
    try {
      const [range, bits] = subnet.split('/');
      const mask = ~(2 ** (32 - parseInt(bits)) - 1);
      const ipLong = this.ip2long(ip);
      const rangeLong = this.ip2long(range);

      if (isNaN(ipLong) || isNaN(rangeLong)) {
        return false;
      }

      return (ipLong & mask) === (rangeLong & mask);
    } catch (error) {
      this.logger.error(`Error checking IP subnet: ${error}`);
      return false;
    }
  }

  private ip2long(ip: string): number {
    try {
      return (
        ip
          .split('.')
          .map((octet) => parseInt(octet, 10))
          .reduce((acc, octet) => (acc << 8) + octet, 0) >>> 0
      );
    } catch (error) {
      this.logger.error(`Invalid IP address format: ${ip}`);
      return NaN;
    }
  }

  private getFilteredHeaders(
    headers: Record<string, any>
  ): Record<string, any> {
    const allowedHeaders = [
      'host',
      'user-agent',
      'content-type',
      'origin',
      'referer',
      'x-real-ip',
      'x-forwarded-for'
    ];

    return Object.keys(headers)
      .filter((key) => allowedHeaders.includes(key.toLowerCase()))
      .reduce((obj, key) => {
        obj[key] = headers[key];
        return obj;
      }, {});
  }

  private getFilteredBody(body: any): Record<string, any> {
    if (!body || typeof body !== 'object') return {};

    const allowedFields = ['username', 'email', 'action'];
    return Object.keys(body)
      .filter((key) => allowedFields.includes(key.toLowerCase()))
      .reduce((obj, key) => {
        obj[key] = typeof body[key] === 'object' ? '[Object]' : body[key];
        return obj;
      }, {});
  }

  private isRequestFromFrontend(origin: string, referer: string): boolean {
    // Kiểm tra origin header
    if (origin && this.isDomainMatch(origin, this.frontendDomain)) {
      return true;
    }

    // Kiểm tra referer header nếu không có origin
    if (
      !origin &&
      referer &&
      this.isDomainMatch(referer, this.frontendDomain)
    ) {
      return true;
    }

    return false;
  }

  private isDomainMatch(url: string, domain: string): boolean {
    try {
      // Loại bỏ protocol (http://, https://)
      const urlWithoutProtocol = url.replace(/^https?:\/\//, '');

      // Kiểm tra nếu domain trùng hoặc là subdomain
      return (
        urlWithoutProtocol === domain ||
        urlWithoutProtocol.startsWith(`${domain}/`) ||
        urlWithoutProtocol.endsWith(`.${domain}`) ||
        urlWithoutProtocol.includes(`.${domain}/`)
      );
    } catch (error) {
      this.logger.error(`Error matching domain: ${error}`);
      return false;
    }
  }
}
