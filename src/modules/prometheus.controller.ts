import { Controller, Get, Header } from '@nestjs/common';
import { PrometheusService } from '../common/metrics/prometheus.service';

@Controller('prometheus/metrics')
export class PrometheusController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  getMetrics() {
    return this.prometheusService.getMetrics();
  }
}
