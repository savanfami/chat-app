import { forwardRef, Module } from '@nestjs/common';
import { GroupModule } from 'src/group/group.module';
import { AuthModule } from 'src/auth/auth.module';
import { GlobalGateway } from './global.gateway';
import { BullmqModule } from 'src/bullmq/bullmq.module';
import { RedisModule } from 'src/redis/redis.module';
GlobalGateway
@Module({
    imports: [GroupModule, AuthModule, forwardRef(() => BullmqModule),RedisModule],
    providers: [GlobalGateway],
    exports: [GlobalGateway]
})
export class GlobalModule { }
