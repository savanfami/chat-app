import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'redis-12114.c264.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 12114,
        password:'ARntialLgwVFTgJijJnm6F8Cxzf58nRK'
      },
    }),
    BullModule.registerQueue({
      name: 'message',
    },{
        name:'notification'
    }),
  ],
  exports:[BullModule]
})
export class BullmqModule {}
