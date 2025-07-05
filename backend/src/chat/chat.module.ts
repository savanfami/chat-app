import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schema/message.schema';
import { AuthModule } from 'src/auth/auth.module';
import { ChatGateway } from './chat.gateway';
import { GroupModule } from 'src/group/group.module';
import { GlobalGateway } from 'src/global/global.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    AuthModule,
    GroupModule
  ],
  controllers: [ChatController],
  providers: [ChatService,ChatGateway,GlobalGateway]
})
export class ChatModule {}
