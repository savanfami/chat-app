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
  private readonly groupService: GroupService
) {}
    afterInit(server: Server) {
        console.log('WebSocket Gateway initialized');
    }

    handleConnection(client: Socket) {
        console.log(`Global client connected: ${client.id}`);

         const token = client.handshake?.auth?.token
        const decoded = Jwt.verify(token,'@@@@@@jsshfds%^^^***9');


        client.on('createGroup', async (data) => {
            try {
                const { name, members } = data
                const userId = (decoded as Jwt.JwtPayload).userId as string;
                const groupdata = await this.groupService.createGroup(name, userId, members)
                // client.emit('groupcreated', groupdata) 
 
                const fetchGroups = await this.groupService.getUserGroups(userId)
                client.emit('fetchGroups', fetchGroups)
            } catch (error) {
                console.log(error, 'error')

            }
        })
    }

    handleDisconnect(client: Socket) {
        console.log(`Global client disconnected: ${client.id}`);
    }
}



// import {
//     OnGatewayConnection,
//     OnGatewayDisconnect,
//     WebSocketGateway,
//     WebSocketServer,
// } from '@nestjs/websockets';
// import { Logger } from '@nestjs/common';
// import { Server, Socket } from 'socket.io';
// import { GroupService } from 'src/group/group.service';
// import * as jwt from 'jsonwebtoken';


// @WebSocketGateway({
//     cors: {
//         origin: 'http://localhost:5173',
//         methods: ['GET', 'POST'],
//         credentials: true,
//     },
// })
// export class GlobalGateway implements OnGatewayConnection, OnGatewayDisconnect {
//     @WebSocketServer()
//     server: Server;

//     private readonly logger = new Logger(GlobalGateway.name);
//     constructor(
//         private readonly groupService: GroupService
//     ) { }
//     afterInit(server: Server) {
//         console.log('WebSocket Gateway initialized');
//     }

//     handleConnection(client: Socket) {
//         console.log(`Global client connected: ${client.id}`);
//         const token = client.handshake?.auth?.token
//         const decoded = jwt.verify(token,'@@@@@@jsshfds%^^^***9');


//         client.on('createGroup', async (data) => {
//             try {
//                 const { name, members } = data
//                 const userId = (decoded as jwt.JwtPayload).userId as string;
//                 const groupdata = await this.groupService.createGroup(name, userId, members)
//                 client.emit('groupcreated', groupdata)
 
//                 // const fetchGroups = await this.groupService.getUserGroups(userId)
//                 // client.emit('fetchGroups', fetchGroups)
//             } catch (error) {
//                 console.log(error, 'error')

//             }
//         })


//     }

//     handleDisconnect(client: Socket) {
//         console.log(`Global client disconnected: ${client.id}`);
//     }
// }
