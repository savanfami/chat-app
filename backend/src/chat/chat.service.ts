import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schema/message.schema';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
    ) { }

    async createMessage(body: CreateMessageDto) {
        const msg = new this.messageModel({
            ...body,
            mediaUrl: body.mediaUrl,
            edited: body.edited ?? false
        })
        return await msg.save()
    }

    async getMessagesForGroup(groupId: string) {
        return this.messageModel.find({ groupId })
            .sort({ createdAt: 1 }).populate('sender').populate('groupId'); 
    }

    async editMessage(msgId:string, content:any) {
        return this.messageModel.findByIdAndUpdate(msgId, { $set: {content} }, { new: true })
    }



}
