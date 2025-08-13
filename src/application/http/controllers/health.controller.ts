import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheService } from '@/infrastructure/cache/cache.service';
import { InjectKnex, Knex } from 'nestjs-knex';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectKnex() private readonly knex: Knex,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  async healthCheck() {
    const startTime = Date.now();

    try {
      // Test database connection
      await this.knex.raw('SELECT 1');

      // Test cache connection
      await this.cacheService.set('health-check', 'ok', 10);
      await this.cacheService.get('health-check');

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: Date.now() - startTime,
        services: {
          database: 'healthy',
          cache: 'healthy',
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }
}
