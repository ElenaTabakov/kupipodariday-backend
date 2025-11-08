import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('wishes')
export class WishesController {
  constructor(
    private readonly wishesService: WishesService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() dto: CreateWishDto) {
    const owner = await this.usersService.findOne({ id: req.user.userId });
    if (!owner) {
      throw new NotFoundException('User not found');
    }
    return this.wishesService.create(dto, owner);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.wishesService.findAll();
  }

  @Get('last')
  findLast() {
    return this.wishesService.findLast();
  }

  @Get('top')
  findTop() {
    return this.wishesService.findTop();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.findOne({ id });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWishDto,
  ) {
    return this.wishesService.updateOne({ id }, dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.wishesService.removeOne({ id }, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  async copyWish(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne({ id: req.user.userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.wishesService.copyWish(id, user);
  }
}
