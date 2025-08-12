import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { ConfigurationService } from '../configuration/configuration.service';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    KnexModule.forRootAsync({
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => ({
        config: {
          client: 'postgresql',
          connection: {
            host: configService.databaseHost,
            port: configService.databasePort,
            user: configService.databaseUser,
            password: configService.databasePassword,
            database: configService.databaseName,
          },
          pool: {
            min: 2,
            max: 10,
          },
          migrations: {
            directory: './src/infrastructure/database/migrations',
            extension: 'ts',
          },
          seeds: {
            directory: './src/infrastructure/database/seeds',
            extension: 'ts',
          },
        },
      }),
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
