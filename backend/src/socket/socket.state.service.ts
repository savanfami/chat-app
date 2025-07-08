import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketStateService {
  private userSocketMap = new Map<string, string>();


  setUserSocket(userId: string, socketId: string) {
        console.log(this.userSocketMap,'setusersocket')

    this.userSocketMap.set(userId, socketId);
  }

getUserSocket(userId:string) {
  const idStr = userId.toString(); 
  console.log(this.userSocketMap);
  return this.userSocketMap.get(idStr);
}


  removeUserSocket(userId: string) {
    this.userSocketMap.delete(userId);
  }
}
