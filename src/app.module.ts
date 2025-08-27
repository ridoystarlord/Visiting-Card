import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  DiscoveryModule,
} from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { AllExceptionsFilter } from "./all-exceptions.filter";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./common/database/database.module";
import { HealthModule } from "./common/health/health.module";
import { RequestLoggerInterceptor } from "./common/interceptor/request-logger.interceptor";
import { ResponseInterceptor } from "./common/interceptor/ResponseInterceptor";
import { MetricsModule } from "./common/metrics/metrics.module";
import { MetricsMiddleware } from "./common/middleware/metrics.middleware";
import { UploadModule } from "./common/upload/upload.module";
import { CustomCacheService } from "./utils/cache.service";
import { ExtractContactModule } from "./models/extract-contact/extract-contact.module";
import { TextractService } from "./common/textract/textract.service";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    DiscoveryModule,
    DatabaseModule,
    HealthModule,
    MetricsModule,
    ExtractContactModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TextractService,
    CustomCacheService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes("*");
  }
}
