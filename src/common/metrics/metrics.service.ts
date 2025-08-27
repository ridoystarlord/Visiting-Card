import { Injectable } from '@nestjs/common';
import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: Registry;
  private readonly httpRequestDuration: Histogram;
  private readonly httpRequestTotal: Counter;
  private readonly errorCounter: Counter;
  private readonly totalRequestCount: Counter;

  constructor() {
    this.registry = new Registry();

    // Add default metrics (CPU, memory, etc.)
    collectDefaultMetrics({ register: this.registry });

    // Custom metrics
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.errorCounter = new Counter({
      name: 'app_error_total',
      help: 'Total number of application errors',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_request_total',
      help: 'Total number of HTTP requests (excluding /metrics)',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.totalRequestCount = new Counter({
      name: 'total_request_count',
      help: 'Total number of HTTP requests (excluding /metrics)',
      registers: [this.registry],
    });
  }

  // Get metrics for Prometheus
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  // Record HTTP request duration
  recordHttpRequestDuration(
    method: string,
    route: string,
    status: number,
    duration: number,
  ): void {
    // Exclude /metrics route from total count
    if (route !== '/api/v1/metrics') {
      this.httpRequestDuration
        .labels(method, route, status.toString())
        .observe(duration);
      this.httpRequestTotal.labels(method, route, status.toString()).inc();
      this.totalRequestCount.inc();
    }
  }

  // Record application error
  recordError(type: string): void {
    this.errorCounter.labels(type).inc();
  }
}
