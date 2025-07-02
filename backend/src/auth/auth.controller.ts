import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/signup.dto';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }
    @Post('signup')
    async signup(@Body() dto: RegisterDto) {
        return await this.authService.signup(dto)
    }
}
 