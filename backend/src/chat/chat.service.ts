import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schema/message.schema';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectQueue('message') private messageQueue: Queue,
  ) {}


  //message queue's

  async queueMessage(data:any){
    await this.messageQueue.add('send-message',data,{
        attempts:3,
        removeOnComplete:true,
        backoff:1000
    })
  }

  async createMessage(body: CreateMessageDto) {
    const msg = new this.messageModel({
      ...body,
      mediaUrl: body.mediaUrl,
      edited: body.edited ?? false,
    });
    return await msg.save();
  }

  async getMessagesForGroup(groupId: string) {
    return this.messageModel
      .find({ groupId })
      .sort({ createdAt: 1 })
      .populate('sender');
  }

  async editMessage(msgId: string, content: any) {
    return this.messageModel.findByIdAndUpdate(
      msgId,
      {
        $set: {
          content,
          edited: true,
        },
      },
      { new: true },
    );
  }
}
