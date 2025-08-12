import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { DomainModule } from '@/domain/domain.module';

@Module({
  imports: [DomainModule],
  providers: [CronjobsService],
})
export class CronjobsModule {}
