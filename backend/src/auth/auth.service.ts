import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt'
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel:Model<User>,
    ){}
      async signup(dto: RegisterDto) {
        const { email, password, username } = dto
        const emailExist = await this.userModel.findOne({ email })
        if (emailExist) {
            throw new ConflictException('email already in use')
        }
        const hashPassword = await bcrypt.hash(password, 10)
        const user = await this.userModel.create({
            username,
            email,
            password: hashPassword
        })
        return {
            message: 'user created successfully'
        }
    }
}
