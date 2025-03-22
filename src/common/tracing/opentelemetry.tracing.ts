import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import {
  MySQLInstrumentation,
  MySQLInstrumentationConfig,
} from '@opentelemetry/instrumentation-mysql';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  BatchSpanProcessor,
  //   ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

// const traceExporter = new ConsoleSpanExporter();

const traceExporter = new OTLPTraceExporter({
  url: 'http://otel-collector:4318/v1/traces',
});

const mysqlDBInstrumentationConfig: MySQLInstrumentationConfig = {
  enhancedDatabaseReporting: true,
};

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'todo-nest-app',
  }),
  spanProcessor: new BatchSpanProcessor(traceExporter),
  instrumentations: [
    new HttpInstrumentation(),
    new NestInstrumentation(),
    new ExpressInstrumentation(),
    new MySQLInstrumentation(mysqlDBInstrumentationConfig),
  ],
});

process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shutdown successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
