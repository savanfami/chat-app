import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { AuthService } from 'src/auth/auth.service';
import { GlobalGateway } from 'src/common/global.gateway';
import { GroupService } from 'src/group/group.service';

@WebSocketGateway({
  namespace: /^\/chat-\w+$/,
  transports: ['websocket'],
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: SocketIOServer;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: AuthService,
    private readonly globalGateway: GlobalGateway,
    private readonly groupService: GroupService,
  ) {}

  afterInit(server: SocketIOServer) {
    this.server = server;
  }

  handleConnection(client: Socket) {
    const namespace = client.nsp;
    console.log(`Client connected to namespace: ${namespace.name}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from ${client.nsp.name}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
    console.log(`Client ${client.id} joined room ${roomId}`);
  }

  @SubscribeMessage('sendmsg')
  async handleSendMessage(
    @MessageBody()
    data: {
      groupId: string;
      content: string;
      sender: string;
      mediaUrl?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { groupId, content, sender, mediaUrl } = data;

    try {
      const savedMessage = await this.chatService.createMessage(data);
      const userInfo = await this.userService.getUserInfo(sender);

      const messageWithUserInfo = {
        id: savedMessage._id,
        groupId,
        content,
        sender: userInfo,
        timestamp: new Date(savedMessage.createdAt as any).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        createdAt: savedMessage.createdAt,
        image: mediaUrl,
      };

      client.nsp.to(groupId).emit('msgreceive', messageWithUserInfo);

      const memberIds = await this.groupService.getGroupMemberIds(groupId);

      const lastMessageData = {
        groupId,
        lastMessage: {
          content,
          sender: userInfo,
          timestamp: savedMessage.createdAt,
        },
      };

      this.globalGateway.emitToUsers(memberIds, 'latestMessageUpdate', lastMessageData);
    } catch (err) {
      console.error('Failed to save or emit message:', err);
    }
  }

  @SubscribeMessage('editMsg')
  async handleEditMessage(
    @MessageBody()
    data: {
      content: string;
      messageId: string;
      groupId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { content, messageId, groupId } = data;

    try {
      const editedMsg = await this.chatService.editMessage(messageId, content);
      client.nsp.to(groupId).emit('editmsgrecieve', editedMsg);
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  }
}
