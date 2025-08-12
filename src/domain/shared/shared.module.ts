import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobsService } from './services/jobs.service';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'default',
    }),
  ],
  providers: [JobsService, NotificationService],
  exports: [JobsService, NotificationService],
})
export class SharedModule {}
