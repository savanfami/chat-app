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
        console.log(body,'bodyyuyyy')
        const msg = new this.messageModel({
            ...body,
            edited: body.edited ?? false
        })  
        return await msg.save()
    }

    async getMessagesForGroup(groupId: string) {
        return this.messageModel.find({ groupId })
            .sort({ createdAt: 1 }).populate('sender')
    }

    //     async getUserInfo(userId: string) {
    //     try {
    //       const user = await this.userModel.findById(userId).select('email name _id');

    //       if (!user) {
    //         throw new Error('User not found');
    //       }

    //       return {
    //         _id: user._id,
    //         email: user.email,
    //         name: user.name || user.email.split('@')[0], // Fallback to email prefix if name doesn't exist
    //       };
    //     } catch (error) {
    //       throw new Error(`Failed to get user info: ${error.message}`);
    //     }
    //   }


   


}
