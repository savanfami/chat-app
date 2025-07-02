import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { GroupController } from './group.controller';

@Module({
  imports:[AuthGuard],
  providers: [GroupService],
  controllers:[GroupController],
})
export class GroupModule {}
