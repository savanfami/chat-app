import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('notification')
@Injectable()
export class NotificationConsumer extends WorkerHost {
  constructor() {
    super();
  }


  async process(job: Job<any>): Promise<any> {
    console.log('inside notification process');
  }
}
