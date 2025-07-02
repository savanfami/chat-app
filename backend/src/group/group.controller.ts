import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { GroupService } from "./group.service";
import { AuthGuard } from "src/auth/auth.guard";

@Controller('groups')
export class GroupController {
    constructor(private readonly groupService: GroupService) { }
    @UseGuards(AuthGuard)
    @Post()
    async createGroup(@Body('name') name: string, @Req() req) {
        return this.groupService.createGroup(name, req.user.id);
    }
    @UseGuards(AuthGuard)
    @Get()
    async getGroups(@Req() req) {
        return this.groupService.getUserGroups(req.user.id);
    }
}
