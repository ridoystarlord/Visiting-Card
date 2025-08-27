import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";

import { Public } from "../decorator/public.decorator";
import { SkipResponseInterceptor } from "../decorator/skip-response-interceptor.decorator";

import { PrismaHealthIndicator } from "./prisma.health";

@ApiTags("Common")
@Controller("health")
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private prismaHealthIndicator: PrismaHealthIndicator
  ) {}

  @Public()
  @SkipResponseInterceptor()
  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      async () => this.prismaHealthIndicator.isHealthy(),
    ]);
  }
}
