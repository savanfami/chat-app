import { Server as SocketIOServer } from 'socket.io';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthService } from 'src/auth/auth.service';

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
      console.log(`Client ${client.id} joined room:======== ${roomId}`);
    });

    // client.on('sendmsg',async (data) => {
    //   console.log(data,'datatataatatat')
    //   const { groupId, content, sender }=data
    //   try {
    //     const savedMessage = await this.chatService.createMessage(data);
    //     namespace.emit('msgreceive', data);
    //     console.log(`Message sent to room ${groupId} in namespace ${client.nsp.name}`);
    //   } catch (err) {
    //     this.logger.error('Failed to save or emit message:', err);
    //   }
    // });
    client.on('sendmsg', async (data) => {
      const { groupId, content, sender } = data;
      try {
        const savedMessage = await this.chatService.createMessage(data);
        console.log(savedMessage,'savedMessage')
        // Get full user info including email
        const userInfo = await this.userService.getUserInfo(sender);
        console.log(userInfo,'user info from auth svc')
         const messageWithUserInfo = {
          id: savedMessage._id,
          groupId,
          content,
          sender: userInfo, // Now contains full user object with email
          timestamp: new Date(savedMessage.createdAt as any ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: savedMessage.createdAt,
        };
        

        namespace.emit('msgreceive', messageWithUserInfo);
      } catch (err) {
        this.logger.error('Failed to save or emit message:', err);
      }
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from ${client.nsp.name}`);
  }

  // emitToRoom(namespaceName: string, roomId: string, event: string, data: any) {
  //   if (this.server) {
  //     this.server.of(namespaceName).to(roomId).emit(event, data);
  //   }
  // }
}