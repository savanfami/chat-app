// import {
//   WebSocketGateway,
//   WebSocketServer,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Logger, UnauthorizedException } from '@nestjs/common';
// import { Server, Socket } from 'socket.io';
// import { GroupService } from 'src/group/group.service';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';

// @WebSocketGateway({
//   cors: {
//     origin: 'http://localhost:5173',
//     credentials: true,
//   },
//   transports: ['websocket'],
// })
// export class GlobalGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   private readonly logger = new Logger(GlobalGateway.name);

//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly configService: ConfigService,
//     private readonly groupService: GroupService
//   ) { }

//   async handleConnection(client: Socket) {
//     try {
//       const token = client.handshake.auth.token;
//       if (!token) {
//         throw new UnauthorizedException('Token not found in handshake.auth');
//       }

//       const payload = await this.jwtService.verifyAsync(token, {
//         secret: this.configService.get<string>('JWT_SECRET'),
//       });

//       (client as any).user = payload.userId;

//       this.logger.log(`Client connected: ${client.id}, user: ${payload.userId}`);
//     } catch (error) {
//       this.logger.error(`Unauthorized socket: ${error.message}`);
//       client.disconnect();
//     }
//   }

//   async emitLastMessageUpdate(client: Socket) {
//     const userId = (client as any).user
//      console.log(userId,'userid')
//     if (!userId) return;
//     try {
//       const groups = await this.groupService.getUserGroups(userId);
//       console.log(groups,'groups')
//       client.emit('updatelastmsg', groups);
//     } catch (error) {
//       this.logger.error(`Failed to emit last message update: ${error.message}`);
//     }
//   }


//   handleDisconnect(client: Socket) {
//     this.logger.log(`Client disconnected: ${client.id}`);
//   }
// }
