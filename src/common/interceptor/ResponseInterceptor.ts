import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SKIP_RESPONSE_INTERCEPTOR } from '../decorator/skip-response-interceptor.decorator';

interface IApiResponse<T> {
  success: boolean;
  message?: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  data?: T | null;
  statusCode: number;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    const shouldSkip = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_INTERCEPTOR,
      [context.getHandler(), context.getClass()],
    );

    if (shouldSkip) {
      return next.handle(); // Skip formatting
    }

    return next.handle().pipe(
      map((result: any) => {
        const pagination = result.pagination || undefined;
        delete result.pagination;

        const response: IApiResponse<T> = {
          success: result.success !== undefined ? result.success : true,
          message: result.message || 'Request processed successfully',
          statusCode: result.statusCode || 200,
          pagination: pagination,
          data: result.data ?? null,
        };

        return response;
      }),
    );
  }
}
