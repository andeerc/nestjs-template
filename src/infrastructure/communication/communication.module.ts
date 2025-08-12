import { Module } from '@nestjs/common';
import { WebSocketCommunicationService } from './websocket-communication.service';
import { COMMUNICATION_SERVICE } from '@/domain/shared/interfaces/communication.interface';
import { GatewayModule } from '@/application/gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  providers: [
    {
      provide: COMMUNICATION_SERVICE,
      useClass: WebSocketCommunicationService,
    },
  ],
  exports: [COMMUNICATION_SERVICE],
})
export class CommunicationModule {}
