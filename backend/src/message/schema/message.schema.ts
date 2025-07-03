import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Message extends Document {
    @Prop()
    groupId: string;

    @Prop()
    senderId: string;

    @Prop()
    content: string;

    @Prop()
    mediaUrl?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
