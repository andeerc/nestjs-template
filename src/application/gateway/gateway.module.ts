import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { DomainModule } from '@/domain/domain.module';

@Module({
  imports: [DomainModule],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
