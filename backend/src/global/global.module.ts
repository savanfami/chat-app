import { Module } from '@nestjs/common';
import { GroupModule } from 'src/group/group.module';
import { AuthModule } from 'src/auth/auth.module';
import { GlobalGateway } from './global.gateway';
GlobalGateway
@Module({
    imports:[GroupModule,AuthModule],
    providers:[GlobalGateway],
    exports:[]
})
export class GlobalModule {}
