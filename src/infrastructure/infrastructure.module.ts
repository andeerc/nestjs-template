import { Global, Module } from '@nestjs/common';
import { ConfigurationModule } from './configuration/configuration.module';
import { BullModule } from '@nestjs/bull';
import { ConfigurationService } from './configuration/configuration.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { FastifyAdapter } from '@bull-board/fastify';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CqrsModule } from '@nestjs/cqrs';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CacheModule } from './cache/cache.module';
import { AuthInfrastructureModule } from './auth/auth-infrastructure.module';
import { CommunicationModule } from './communication/communication.module';
import { JwtUtilService } from './auth/jwt-util.service';

@Global()
@Module({
  imports: [
    ConfigurationModule,
    AuthInfrastructureModule,
    CommunicationModule,
    BullModule.forRootAsync({
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => ({
        redis: {
          host: configService.redisHost,
          port: configService.redisPort,
          password: configService.redisPassword,
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 100,
          attempts: 3,
          backoff: {
            type: 'fixed',
            delay: 5000,
          },
        },
        metrics: {
          maxDataPoints: 500,
        },
      }),
    }),
    BullBoardModule.forRootAsync({
      inject: [JwtUtilService],
      useFactory: (jwtUtilService: JwtUtilService) => ({
        boardOptions: {
          uiConfig: {
            boardTitle: 'Jobs Dashboard',
          },
        },
        route: '/bull',
        adapter: FastifyAdapter,
      }),
    }),
    RedisModule.forRootAsync({
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => ({
        type: 'single',
        url: `redis://:${configService.redisPassword}@${configService.redisHost}:${configService.redisPort}`,
      }),
    }),
    ScheduleModule.forRoot(),
    CqrsModule.forRoot(),
    DatabaseModule,
    CacheModule,
  ],
  exports: [
    ConfigurationModule,
    DatabaseModule,
    CacheModule,
    AuthInfrastructureModule,
    CommunicationModule,
  ],
})
export class InfrastructureModule {}
