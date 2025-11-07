import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    private usersService: UsersService,
    private wishesService: WishesService,
  ) {}

  async create(dto: CreateWishlistDto, userId: number) {
    const user = await this.usersService.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const items = dto.items?.length
      ? await this.wishesService.findByIds(dto.items)
      : [];

    if (dto.items?.length && items.length !== dto.items.length) {
      throw new NotFoundException('One or more wishes not found');
    }

    const wishlist = this.wishlistsRepository.create({
      ...dto,
      owner: user,
      items,
    });

    return this.wishlistsRepository.save(wishlist);
  }

  findAll() {
    return this.wishlistsRepository.find({
      relations: ['owner', 'items'],
    });
  }

  async findOne(id: number) {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    return wishlist;
  }

  async updateOne(id: number, userId: number, dto: UpdateWishlistDto) {
    const wishlist = await this.findOne(id);

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('You are not the owner of this wishlist');
    }

    if (dto.items) {
      const items = dto.items.length
        ? await this.wishesService.findByIds(dto.items)
        : [];

      if (dto.items.length && items.length !== dto.items.length) {
        throw new NotFoundException('One or more wishes not found');
      }

      wishlist.items = items;
    }

    Object.assign(wishlist, dto);

    return this.wishlistsRepository.save(wishlist);
  }

  async removeOne(id: number, userId: number) {
    const wishlist = await this.findOne(id);

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('You are not the owner of this wishlist');
    }

    return this.wishlistsRepository.remove(wishlist);
  }
}
