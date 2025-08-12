import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  ICommunicationService,
  COMMUNICATION_SERVICE,
} from '../interfaces/communication.interface';

export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  data?: any;
  userId?: string;
  room?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(COMMUNICATION_SERVICE)
    private readonly communicationService: ICommunicationService,
  ) {}

  async sendToUser(userId: string, notification: NotificationPayload): Promise<void> {
    this.logger.log(`Sending notification to user ${userId}: ${notification.title}`);

    await this.communicationService.sendToUser(userId, 'notification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  async sendToRoom(room: string, notification: NotificationPayload): Promise<void> {
    this.logger.log(`Sending notification to room ${room}: ${notification.title}`);

    await this.communicationService.sendToRoom(room, 'notification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  async broadcast(notification: NotificationPayload): Promise<void> {
    this.logger.log(`Broadcasting notification: ${notification.title}`);

    await this.communicationService.broadcastToAll('notification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  async sendJobUpdate(jobId: string, status: string, data?: any): Promise<void> {
    const notification: NotificationPayload = {
      type: 'job_update',
      title: 'Job Update',
      message: `Job ${jobId} is now ${status}`,
      data: { jobId, status, ...data },
    };

    this.broadcast(notification);
  }

  async sendSystemAlert(
    message: string,
    severity: 'info' | 'warning' | 'error' = 'info',
  ): Promise<void> {
    const notification: NotificationPayload = {
      type: 'system_alert',
      title: 'System Alert',
      message,
      data: { severity },
    };

    this.broadcast(notification);
  }
}
