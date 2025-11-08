import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WishesService } from 'src/wishes/wishes.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('find')
  findMany(@Body('query') query: string) {
    return this.usersService.findMany(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getprofile(@Request() req) {
    const user = await this.usersService.findOne({ id: req.user.userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateOne({ id: req.user.userId }, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/wishes')
  getMyWishes(@Request() req) {
    return this.wishesService.findMany({
      owner: { id: req.user.userId },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':username')
  getByUsername(@Param('username') username: string) {
    return this.usersService.findOne({ username });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':username/wishes')
  getUserWishes(@Param('username') username: string) {
    return this.wishesService.findMany({
      owner: { username },
    });
  }
}
