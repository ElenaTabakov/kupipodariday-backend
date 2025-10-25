import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authServise: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.authServise.signup(createUserDto);
  }

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  async signin(@Request() req) {
    return await this.authServise.login(req.user);
  }
}
