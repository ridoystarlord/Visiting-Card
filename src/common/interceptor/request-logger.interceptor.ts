// src/interceptors/request-logger.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { DatabaseService } from "../database/database.service";

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  constructor(private prisma: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip logging for GET requests
    if (request.method === "GET") {
      return next.handle();
    }

    // At this point, auth guards have already executed, so we can access the authenticated user
    const user = request.user as any;
    const userId = user?.id || "unauthenticated";
    const userIP = request.ip || request.connection.remoteAddress;
    const params = request.params;

    // Process the request and log to database after response is generated
    return next.handle().pipe(
      tap(async () => {
        try {
          // Store the log in the database
          await this.prisma.requestLog.create({
            data: {
              method: request.method,
              url: request.originalUrl,
              ip: userIP || null,
              userAgent: request.headers["user-agent"] || null,
              requestBody: request.body,
              requestParams: params,
            },
          });
        } catch (error) {
          // this.logger.error(`Failed to store request log: ${error.message}`);
        }
      })
    );
  }
}
