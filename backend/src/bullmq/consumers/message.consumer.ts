import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';
import { GlobalGateway } from 'src/common/global.gateway';
import { AuthService } from 'src/auth/auth.service';
import { GroupService } from 'src/group/group.service';
import { ChatGateway } from 'src/chat/chat.gateway';

@Processor('message')
@Injectable()
export class MessageConsumer extends WorkerHost {
  constructor(
    private readonly chatService: ChatService,
    private readonly globalGateway: GlobalGateway,
    private readonly userService: AuthService,
    private readonly groupService: GroupService,
    private readonly chatGateway:ChatGateway
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { groupId, content, sender, mediaUrl } = job.data;

    const savedMessage = await this.chatService.createMessage(job.data);

    const userInfo = await this.userService.getUserInfo(sender);

    const messageWithUserInfo = {
      id: savedMessage._id,
      groupId,
      content,
      sender: userInfo,
      timestamp: new Date(savedMessage.createdAt as any).toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      ),
      createdAt: savedMessage.createdAt,
      image: mediaUrl,
    };

    this.chatGateway.server.to(groupId).emit('msgreceive', messageWithUserInfo);
    const lastMessageData = {
      groupId,
      lastMessage: {
        content,
        sender: userInfo,
        timestamp: savedMessage.createdAt,
      },
    };

    this.globalGateway.emitToUsers(
      await this.groupService.getGroupMemberIds(groupId),
      'latestMessageUpdate',
      lastMessageData,
    );

    return { status: 'ok' };
  }
}
