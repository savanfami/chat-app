
// import {
//   WebSocketGateway,
//   WebSocketServer,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   OnGatewayInit
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway({
//   cors: {
//     // origin: 'http://localhost:5173',  
//     origin: '*',  
//   },
// })
// export class GlobalGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer() server: Server;

//   afterInit(server: Server) {
//     console.log('Global socket server initialized');
//   }

//   handleConnection(client: Socket) {
//     console.log(`Client connected: ${client.id}`);
//     // You can broadcast global events, or track global presence here
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
//   }

//   // Emit to all connected clients
//   emitGlobalEvent(eventName: string, payload: any) {
//     this.server.emit(eventName, payload);
//   }
// }
