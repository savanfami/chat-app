import { Server as SocketIOServer } from 'socket.io';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthService } from 'src/auth/auth.service';
import { GroupService } from 'src/group/group.service';

@WebSocketGateway({
  namespace: /^\/chat-\w+$/,
  transports: ['websocket'],
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
@UseGuards(AuthGuard)

export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: SocketIOServer;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: AuthService,
    private readonly groupService: GroupService
  ) { }
  afterInit(server: SocketIOServer) {
    // console.log('websocket conenction initialised')
    this.server = server;
  }

  handleConnection(client: Socket) {
    const namespace = client.nsp;
    console.log(`Client connected to namespace: ${namespace.name}`);

    client.on('joinRoom', (roomId: string) => {
      client.join(roomId);
      console.log(`Client ${client.id} ====== ${roomId}`);
    });

    client.on('sendmsg', async (data) => {
      const { groupId, content, sender } = data;
      try {
        const savedMessage = await this.chatService.createMessage(data);
        // Get full user info including email
        const userInfo = await this.userService.getUserInfo(sender);
        // console.log(savedMessage, 'savedMessage')//exclude password not done
        // console.log(userInfo,'user info from auth svc')
        const messageWithUserInfo = {
          id: savedMessage._id,
          groupId,
          content,
          sender: userInfo,
          timestamp: new Date(savedMessage.createdAt as any).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: savedMessage.createdAt,
          image: data.mediaUrl
        };
        client.nsp.to(groupId).emit('msgreceive', messageWithUserInfo);
        const updatelastmsg = await this.groupService.updateLastMessage(groupId, content, data.mediaUrl)
        // client.nsp.to(groupId).emit('updatelastmsg', updatelastmsg);
        this.server.emit('updatelastmsg', updatelastmsg);//for glbl emitting sidebar of chat app


      } catch (err) {
        this.logger.error('Failed to save or emit message:', err);
      }
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from ${client.nsp.name}`);
  }


}