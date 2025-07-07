import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GroupService } from 'src/group/group.service';
import * as Jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

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

  constructor(private readonly groupService: GroupService) {}

  afterInit(server: Server) {
    // Optional server init logic
  }

  handleConnection(client: Socket) {
    console.log(`global user connected ${client.id}`);

    try {
      const token = client.handshake?.auth?.token;
      const decoded = Jwt.verify(token, '@@@@@@jsshfds%^^^***9');
      const userId = (decoded as Jwt.JwtPayload).userId as string;

      this.userSocketMap.set(userId, client.id);
      client.data.userId = userId;

      client.on('createGroup', async (data) => {
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
          console.error('Error creating group:', error);
        }
      });
    } catch (err) {
      console.log('Invalid JWT token in handshake', err);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`global user disconnected: ${client.id}`);
    const userId = client.data?.userId;

    if (userId && this.userSocketMap.get(userId) === client.id) {
      this.userSocketMap.delete(userId);
    }
  }


  emitToUsers(userIds: string[], event: string, data: any) {
    for (const userId of userIds) {
      const socketId = this.userSocketMap.get(userId);
      if (socketId) {
        const client = this.server.sockets.sockets.get(socketId);
        if (client?.connected) {
          client.emit(event, data);
        } else {
          this.logger.warn(`Socket ${socketId} for user ${userId} not connected`);
        }
      } else {
        this.logger.warn(`No socket found for user ${userId}`);
      }
    }
  }
}
