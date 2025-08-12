import { Module } from '@nestjs/common';
import { ApplicationModule } from './application/application.module';
import { DomainModule } from './domain/domain.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [InfrastructureModule, DomainModule, ApplicationModule, IntegrationsModule],
})
export class AppModule {}
