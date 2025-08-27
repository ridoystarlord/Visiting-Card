import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: DatabaseService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      // Perform a simple query to check the database connection
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus('database', true);
    } catch (error) {
      return this.getStatus('database', false, { message: error.message });
    }
  }
}
