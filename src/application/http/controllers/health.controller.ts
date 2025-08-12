import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { CacheService } from '@/infrastructure/cache/cache.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  async healthCheck() {
    const startTime = Date.now();

    try {
      // Test database connection
      await this.databaseService.getKnex().raw('SELECT 1');

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
