import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as Jwt from 'jsonwebtoken';
import { GroupService } from 'src/group/group.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class GlobalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GlobalGateway.name);
  private userSocketMap = new Map<string, string>();

  constructor(
    private readonly groupService: GroupService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {}

  handleConnection(client: Socket) {
    console.log(`global user connected ${client.id}`);

    try {
      const token = client.handshake?.auth?.token;
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('jwt secret is not defined in environment');
      }

      const decoded = Jwt.verify(token, jwtSecret);
      const userId = (decoded as Jwt.JwtPayload).userId as string;

      this.userSocketMap.set(userId, client.id);
      client.data.userId = userId;
    } catch (err) {
      console.log('invalid jwt token ', err);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`global user disconnected- ${client.id}`);
    const userId = client.data?.userId;

    if (userId && this.userSocketMap.get(userId) === client.id) {
      this.userSocketMap.delete(userId);
    }
  }



  @SubscribeMessage('createGroup')
  async handleCreateGroup(
    @MessageBody() data: { name: string; members: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data?.userId;
    if (!userId) {
      client.emit('error', 'Unauthorized');
      return;
    }

    try {
      const { name, members } = data;
      const newGroup = await this.groupService.createGroup(name, userId, members);
      const groupMemberIds = [...members, userId];

      for (const memberId of groupMemberIds) {
        const socketId = this.userSocketMap.get(memberId);
        if (socketId) {
          this.server.to(socketId).emit('groupCreated', newGroup);
        }
      }
    } catch (error) {
      console.log('Error creating group:', error);
      client.emit('error', 'Group creation failed');
    }
  }

  emitToUsers(userIds: string[], event: string, data: any) {
    for (const userId of userIds) {
      const socketId = this.userSocketMap.get(userId);
      if (socketId) {
        const client = this.server.sockets.sockets.get(socketId);
        if (client?.connected) {
          client.emit(event, data);
        }
      }
    }
  }
}
