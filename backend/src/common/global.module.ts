import { forwardRef, Module } from '@nestjs/common';
import { GroupModule } from 'src/group/group.module';
import { AuthModule } from 'src/auth/auth.module';
import { GlobalGateway } from './global.gateway';
import { BullmqModule } from 'src/bullmq/bullmq.module';
GlobalGateway
@Module({
    imports: [GroupModule, AuthModule, forwardRef(() => BullmqModule)],
    providers: [GlobalGateway],
    exports: [GlobalGateway]
})
export class GlobalModule { }
