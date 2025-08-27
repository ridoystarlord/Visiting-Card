import KeyvRedis from '@keyv/redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Keyv } from 'keyv';

@Injectable()
export class CustomCacheService {
  private keyv: Keyv;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://redis:6379',
    );
    this.keyv = new Keyv({ store: new KeyvRedis(redisUrl) });
  }

  async get<T>(key: string): Promise<T | null> {
    return (await this.keyv.get(key)) as T | null;
  }

  async set<T>(key: string, value: T, ttl: number = 10): Promise<void> {
    await this.keyv.set(key, value, ttl * 1000); // TTL in ms
  }

  async delete(key: string): Promise<void> {
    await this.keyv.delete(key);
  }
}
