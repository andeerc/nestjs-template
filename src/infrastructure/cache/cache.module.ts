import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigurationService } from '../configuration/configuration.service';
import { CacheService } from './cache.service';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => ({
        store: 'redis',
        host: configService.redisHost,
        port: configService.redisPort,
        password: configService.redisPassword || undefined,
        ttl: 3600, // 1 hour default
        max: 100, // maximum number of items in cache
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
