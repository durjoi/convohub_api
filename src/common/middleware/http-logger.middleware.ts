import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] || uuidv4();
    const startTime = Date.now();

    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    // Log request
    this.logger.log('Incoming request', 'HttpLogger', {
      requestId,
      method: req.method,
      url: req.url,
      path: req.path,
      params: req.params,
      query: req.query,
      headers: this.sanitizeHeaders(req.headers),
      body: this.sanitizeBody(req.body),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Handle response logging
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      this.logger.log('Request completed', 'HttpLogger', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        contentLength: res.get('content-length'),
        userAgent: req.get('user-agent'),
      });
    });

    res.on('error', (error) => {
      this.logger.error('Request failed', 'HttpLogger', {
        requestId,
        method: req.method,
        url: req.url,
        error: {
          message: error.message,
          stack: error.stack,
        },
      });
    });

    next();
  }

  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'password'];
    const sanitized = { ...headers };

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = ['password', 'token', 'secret', 'credit_card'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
