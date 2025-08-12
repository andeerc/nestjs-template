import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheService } from '@/infrastructure/cache/cache.service';

@Injectable()
export class CronjobsService {
  private readonly logger = new Logger(CronjobsService.name);

  constructor(private readonly cacheService: CacheService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredCache() {
    this.logger.log('Running cache cleanup job...');

    try {
      // Add your cache cleanup logic here
      await this.cacheService.del('temp-*');
      this.logger.log('Cache cleanup completed successfully');
    } catch (error) {
      this.logger.error('Cache cleanup failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async dailyMaintenance() {
    this.logger.log('Running daily maintenance job...');

    try {
      // Add your daily maintenance tasks here
      // Examples: generate reports, clean old logs, backup data, etc.

      this.logger.log('Daily maintenance completed successfully');
    } catch (error) {
      this.logger.error('Daily maintenance failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async weeklyReports() {
    this.logger.log('Running weekly reports job...');

    try {
      // Add your weekly report generation logic here

      this.logger.log('Weekly reports completed successfully');
    } catch (error) {
      this.logger.error('Weekly reports failed:', error);
    }
  }
}
