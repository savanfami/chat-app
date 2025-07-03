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

    client.on('message:create', (data) => {
      console.log(`Message created in ${namespace.name}:`, data,'messageeeeee is ');
      namespace.emit('message:receive', data);
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from ${client.nsp.name}`);
  }

  emitToRoom(namespaceName: string, roomId: string, event: string, data: any) {
    if (this.server) {
      this.server.of(namespaceName).to(roomId).emit(event, data);
    }
  }
}