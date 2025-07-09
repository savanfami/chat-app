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
import { NotificationService } from 'src/bullmq/queues/notification.queue';
import { AuthService } from 'src/auth/auth.service';

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

  constructor(
    private readonly groupService: GroupService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) { }

  afterInit(server: Server) { }

  async handleConnection(client: Socket) {
    console.log(`global user connected ${client.id}`);

    try {
      const token = client.handshake?.auth?.token;
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('jwt secret is not defined in environment');
      }

      const decoded = Jwt.verify(token, jwtSecret);
      const userId = (decoded as Jwt.JwtPayload).userId as string;
      console.log('userid',userId)
      client.join(userId);
      client.data.userId = userId;
      client.join(userId)
      const allMembers = await this.authService.getAllmembers()
      const onlineUsers: any = []
      for (const user of allMembers) {
        const userId = user._id as any
        const memberId = userId.toString()
        console.log(memberId,'memberid')
        if (memberId === userId) continue;
        const sockets = await this.server.in(memberId).fetchSockets(); 
        // console.log(sockets,'sockets')
        // if (sockets.length > 0) {
          // onlineUsers.push({
          //   _id: memberId,
          //   username: user.username,
          // });

          await this.notificationService.queueNotification({
            targetUserId: memberId,
            statusUserId: userId,
            status: 'online',
          });
          // client.emit('onlineUsers', onlineUsers);

        // }
      }

    } catch (err) {
      console.log('invalid jwt token ', err);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`global user disconnected- ${client.id}`);
  //     const userId = client.data?.userId;
  // if (!userId) return;

  // setTimeout(async () => {
  //   const sockets = await this.server.in(userId).fetchSockets();
  //   if (sockets.length === 0) {
  //     const allUsers = await this.userService.getAllUsers();

  //     for (const user of allUsers) {
  //       const memberId = user._id.toString();
  //       if (memberId === userId) continue;

  //       const sockets = await this.server.in(memberId).fetchSockets();
  //       if (sockets.length > 0) {
  //         await this.notificationService.queueUserStatusNotify({
  //           targetUserId: memberId,
  //           statusUserId: userId,
  //           status: 'offline',
  //         });
  //       }
  //     }

  //     this.logger.log(`User ${userId} fully disconnected`);
  //   }
  // }, 1000);
  }

  @SubscribeMessage('createGroup')
  async handleCreateGroup(
    @MessageBody() data: { name: string; members: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data?.userId;
    if (!userId) {
      console.log('no user id found in global gateway');
      return;
    }

    try {
      const { name, members } = data;
      const newGroup = await this.groupService.createGroup(
        name,
        userId,
        members,
      );
      const groupMemberIds = [...members, userId];

      for (const memberId of groupMemberIds) {
        this.server.to(memberId).emit('groupCreated', newGroup);
      }
    } catch (error) {
      console.log('Error creating group:', error);
      client.emit('error', 'Group creation failed');
    }
  }

  emitToUsers(userIds: string[], event: string, data: any) {
    console.log(userIds,'emitting for logins',event,data)
    for (const userId of userIds) {
      this.server.to(userId).emit(event, data);
    }
  }
}
