import { Module } from '@nestjs/common';
import { GroupModule } from 'src/group/group.module';
// import { GlobalGateway } from './global.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports:[GroupModule,AuthModule],
    providers:[],
})
export class GlobalModule {}
