import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketStateService {
  private userSocketMap = new Map<string, string>();


  setUserSocket(userId: string, socketId: string) {
        console.log(this.userSocketMap,'setusersocket')

    this.userSocketMap.set(userId, socketId);
  }

getUserSocket(userId) {
  const idStr = userId.toString(); 
  console.log(idStr, 'userId (as string)');
  console.log(this.userSocketMap);
  return this.userSocketMap.get(idStr);
}


  removeUserSocket(userId: string) {
    this.userSocketMap.delete(userId);
  }
}
