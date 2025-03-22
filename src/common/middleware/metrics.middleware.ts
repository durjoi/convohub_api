import { Injectable, NestMiddleware } from '@nestjs/common';
import { PrometheusService } from '../metrics/prometheus.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly prometheusService: PrometheusService) {}

  use(req: any, res: any, next: () => void) {
    const start = Date.now();

    res.on('finish', () => {
      // Filter API paths starting with "api/v1/"
      if (req.path.startsWith('/api/v1/')) {
        const duration = Date.now() - start; // Calculate request duration
        const status = res.statusCode; // Get response status code

        // Call the PrometheusService to record the metrics
        this.prometheusService.recordHttpRequest(
          req.method,
          req.path,
          status,
          duration,
        );
      }
    });

    next();
  }
}
