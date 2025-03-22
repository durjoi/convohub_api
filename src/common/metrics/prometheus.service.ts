import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Registry,
  Gauge,
  Counter,
  Histogram,
} from 'prom-client';

@Injectable()
export class PrometheusService implements OnModuleInit {
  private readonly register: Registry;

  // Existing metrics
  private readonly httpRequestDuration: Gauge<string>;
  private readonly httpRequestCount: Counter<string>;
  private readonly httpRequestDurationMicroseconds: Histogram<string>;

  private readonly requestLatencyPercentiles: Histogram<string>;

  constructor() {
    this.register = new Registry();
    collectDefaultMetrics({ register: this.register });

    // HTTP Request Metrics
    this.httpRequestCount = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.register],
    });

    this.httpRequestDuration = new Gauge({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path', 'status'],
      registers: [this.register],
    });

    this.httpRequestDurationMicroseconds = new Histogram({
      name: 'http_server_request_duration_seconds_bucket',
      help: 'HTTP request duration in seconds with buckets',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    // Request Latency Percentiles
    this.requestLatencyPercentiles = new Histogram({
      name: 'http_request_latency_percentiles_seconds',
      help: 'Request latency percentiles (e.g., 95th, 99th)',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
      registers: [this.register],
    });
  }

  onModuleInit() {
    console.log('Prometheus metrics initialized');
  }

  public getMetrics() {
    return this.register.metrics();
  }

  public recordHttpRequest(
    method: string,
    path: string,
    status: number,
    duration: number,
  ) {
    // Record HTTP request count
    this.httpRequestCount.labels(method, path, status.toString()).inc();

    // Record HTTP request duration in seconds
    this.httpRequestDuration
      .labels(method, path, status.toString())
      .set(duration / 1000);

    // Record microseconds histogram
    this.httpRequestDurationMicroseconds
      .labels(method, path, status.toString())
      .observe(duration / 1000);

    // Record latency percentiles
    this.requestLatencyPercentiles
      .labels(method, path, status.toString())
      .observe(duration / 1000);
  }
}
