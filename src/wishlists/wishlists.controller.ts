import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createWishlistDto: CreateWishlistDto) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Invalid token');
    }

    return await this.wishlistsService.create(
      createWishlistDto,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return await this.wishlistsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.wishlistsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Invalid token');
    }

    return await this.wishlistsService.updateOne(
      id,
      req.user.userId,
      updateWishlistDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Invalid token');
    }

    return await this.wishlistsService.removeOne(id, req.user.userId);
  }
}
