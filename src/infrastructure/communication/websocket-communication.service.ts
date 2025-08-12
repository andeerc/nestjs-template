import { Injectable, Logger } from '@nestjs/common';
import { ICommunicationService } from '@/domain/shared/interfaces/communication.interface';
import { AppGateway } from '@/application/gateway/app.gateway';

@Injectable()
export class WebSocketCommunicationService implements ICommunicationService {
  private readonly logger = new Logger(WebSocketCommunicationService.name);

  constructor(private readonly appGateway: AppGateway) {}

  async sendToUser(userId: string, event: string, data: any): Promise<void> {
    this.logger.log(`Sending ${event} to user ${userId}`);
    const userRoom = `user-${userId}`;
    this.appGateway.broadcastToRoom(userRoom, event, data);
  }

  async sendToRoom(room: string, event: string, data: any): Promise<void> {
    this.logger.log(`Sending ${event} to room ${room}`);
    this.appGateway.broadcastToRoom(room, event, data);
  }

  async broadcastToAll(event: string, data: any): Promise<void> {
    this.logger.log(`Broadcasting ${event} to all users`);
    this.appGateway.broadcastToAll(event, data);
  }
}
