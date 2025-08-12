import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { ConfigurationService } from '../configuration/configuration.service';
import { InjectKnex, Knex } from 'nestjs-knex';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectKnex() private readonly knex: Knex,
    private readonly configService: ConfigurationService,
  ) {}

  async onModuleInit() {
    await this.runMigrations();
    await this.runSeeds();
  }

  async runMigrations(): Promise<void> {
    try {
      this.logger.log('Running database migrations...');
      const [batchNo, log] = await this.knex.migrate.latest();

      if (log.length === 0) {
        this.logger.log('Database is already up to date');
      } else {
        this.logger.log(`Batch ${batchNo} run: ${log.length} migrations`);
        log.forEach((migration) => this.logger.log(`✓ ${migration}`));
      }
    } catch (error) {
      this.logger.error('Migration failed:', error);
      throw error;
    }
  }

  async runSeeds(): Promise<void> {
    if (this.configService.nodeEnv === 'production') {
      this.logger.log('Skipping seeds in production environment');
      return;
    }

    try {
      this.logger.log('Running database seeds...');
      const [log] = await this.knex.seed.run();

      if (log.length === 0) {
        this.logger.log('No seed files found or all seeds already run');
      } else {
        this.logger.log(`Run: ${log.length} seed files`);
        log.forEach((seed) => this.logger.log(`✓ ${seed}`));
      }
    } catch (error) {
      this.logger.error('Seed failed:', error);
      throw error;
    }
  }

  getKnex(): Knex {
    return this.knex;
  }
}
