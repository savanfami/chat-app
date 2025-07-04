import { Body, Controller, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('messages')
export class ChatController {
    constructor(private readonly chatservice: ChatService) { }
    @Post()
    @UseGuards(AuthGuard)
    async createMessage(@Body() body: CreateMessageDto, @Req() req) {
        const sender = req.user.userId
        return this.chatservice.createMessage({
            ...body,
            sender
        })
    }

    @UseGuards(AuthGuard)
    @Get(':groupId')
    async getMessageByGroup(@Param('groupId') groupId: string) {
        // console.log(groupId,'group id is here')
        return this.chatservice.getMessagesForGroup(groupId)
    }

    // @Post('upload')     
    // @UseInterceptors(FileInterceptor('file'))
    // uploadFile(@UploadedFile() file: Express.Multer.File) {
    //     return this.chatservice.handleFileUpload(file);
    // }

}
