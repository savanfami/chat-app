import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group } from './schema/group.schema';
import { Model } from 'mongoose';

@Injectable()
export class GroupService {
    constructor(
        @InjectModel(Group.name) private groupModel: Model<Group>
    ) { }

    async createGroup(name: string, creatorId: string, members: string[]) {
        const allMembers = [creatorId, ...members];
        const group = new this.groupModel({ name, members: allMembers,createdBy:creatorId });
        return group.save();
    }
    async getUserGroups(userId: string) {
        return this.groupModel.find({ members: userId });
    }
}
