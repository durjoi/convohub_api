import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino from 'pino';
import { trace, context } from '@opentelemetry/api';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      timestamp: false,
      transport: {
        targets: [
          // ...(process.env.NODE_ENV !== 'production'
          //   ? [
          //       {
          //         target: 'pino-pretty',
          //         options: {
          //           colorize: true,
          //           levelFirst: true,
          //           translateTime: 'SYS:standard',
          //         },
          //       },
          //     ]
          //   : []),
          {
            target: 'pino-loki',
            level: process.env.LOG_LEVEL || 'info',
            options: {
              host: process.env.LOKI_HOST || 'http://loki:3100',
              debug: true,
              batching: true,
              interval: 5,
              labels: {
                application: process.env.APP_NAME || 'convohub',
                environment: process.env.NODE_ENV || 'development',
                service: process.env.SERVICE_NAME || 'convohub-backend-api',
                hostname: 'convohub',
              },
              levelKey: 'level', // Specify the key for the level (make sure this is consistent)
            },
          },
        ].filter(Boolean),
      },
      base: {
        env: process.env.NODE_ENV || 'development',
        service: process.env.SERVICE_NAME || 'convohub-backend-api',
      },
    });
  }

  private getTraceContext() {
    const span = trace.getSpan(context.active());
    if (!span) return {};

    const spanContext = span.spanContext();
    return {
      traceId: spanContext.traceId || 'undefined',
      spanId: spanContext.spanId || 'undefined',
    };
  }

  log(message: any, context = '', metadata = {}) {
    this.logger.info({ context, metadata, ...this.getTraceContext() }, message);
  }

  error(message: any, context = '', metadata = {}) {
    this.logger.error(
      { trace, context: context, metadata, ...this.getTraceContext() },
      JSON.stringify(message),
    );
  }

  warn(message: any, context = '', metadata = {}) {
    this.logger.warn(
      { context, metadata, ...this.getTraceContext() },
      JSON.stringify(message),
    );
  }

  debug(message: any, context = '', metadata = {}) {
    this.logger.debug(
      { context, metadata, ...this.getTraceContext() },
      JSON.stringify(message),
    );
  }

  verbose(message: any, context = '', metadata = {}) {
    this.logger.trace(
      { context, metadata, ...this.getTraceContext() },
      JSON.stringify(message),
    );
  }

  child(bindings: Record<string, any>): LoggerService {
    const childLogger = this.logger.child(bindings);
    const childLoggerService = new LoggerService();
    (childLoggerService as any).logger = childLogger;
    return childLoggerService;
  }
}
