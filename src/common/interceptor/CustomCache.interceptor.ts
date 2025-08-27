import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs'; // Import `of`
import { tap } from 'rxjs/operators';

import { CustomCacheService } from '../../utils/cache.service';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CustomCacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only cache GET requests
    if (request.method !== 'GET') return next.handle();

    const cacheKey = `cache(${user?.id}):${request.url}`;
    const cachedResponse = await this.cacheService.get(cacheKey);

    // ✅ FIX: Wrap cached response inside `of()`
    if (cachedResponse) {
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheService.set(cacheKey, data, 10); // Cache for 10s
      }),
    );
  }
}
