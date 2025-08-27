import { Controller, Get, Header } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { Public } from "../decorator/public.decorator";
import { SkipResponseInterceptor } from "../decorator/skip-response-interceptor.decorator";

import { MetricsService } from "./metrics.service";

@ApiTags("Common")
@Controller("metrics")
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Public()
  @SkipResponseInterceptor()
  @Get()
  @Header("Content-Type", "text/plain")
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
