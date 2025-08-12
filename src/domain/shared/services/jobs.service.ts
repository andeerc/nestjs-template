import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface JobData {
  id?: string;
  type: string;
  payload: any;
  userId?: string;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(@InjectQueue('default') private defaultQueue: Queue) {}

  async addJob(name: string, data: JobData, options?: any): Promise<void> {
    this.logger.log(`Adding job: ${name} with data: ${JSON.stringify(data)}`);

    await this.defaultQueue.add(name, data, {
      attempts: 3,
      backoff: 'fixed',
      delay: 1000,
      ...options,
    });
  }

  async addDelayedJob(name: string, data: JobData, delay: number): Promise<void> {
    await this.addJob(name, data, { delay });
  }

  async addCronJob(name: string, data: JobData, cron: string): Promise<void> {
    await this.addJob(name, data, { repeat: { cron } });
  }

  async getJobCounts(): Promise<any> {
    return {
      waiting: await this.defaultQueue.getWaiting().then((jobs) => jobs.length),
      active: await this.defaultQueue.getActive().then((jobs) => jobs.length),
      completed: await this.defaultQueue.getCompleted().then((jobs) => jobs.length),
      failed: await this.defaultQueue.getFailed().then((jobs) => jobs.length),
    };
  }

  async clearQueue(): Promise<void> {
    await this.defaultQueue.empty();
    this.logger.log('Queue cleared');
  }
}
