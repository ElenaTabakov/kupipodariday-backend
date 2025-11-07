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
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  async create(ownerId: number, CreateWishlistDto: CreateWishlistDto) {
    const owner = await this.usersService.findOne({ id: ownerId });

    const items = CreateWishlistDto.items
      ? await this.wishesService.findByIds(CreateWishlistDto.items)
      : [];

    const wishlist = this.wishlistsRepository.create({
      ...CreateWishlistDto,
      owner,
      items,
    });

    return this.wishlistsRepository.save(wishlist);
  }

  findAll() {
    return this.wishlistsRepository.find({ relations: ['owner', 'items'] });
  }

  async findOne(id: number) {
    const wishListId = await this.wishlistsRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
    if (!wishListId) throw new NotFoundException('Whishlist not found');
    return wishListId;
  }

  async updateOne(
    id: number,
    userId: number,
    UpdateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlist = await this.findOne(id);

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('You cannot edit someone else wishlist');
    }

    if (UpdateWishlistDto.items) {
      wishlist.items = await this.wishesService.findByIds(
        UpdateWishlistDto.items,
      );
    }

    Object.assign(wishlist, UpdateWishlistDto);
    return this.wishlistsRepository.save(wishlist);
  }

  async removeOne(id: number, userId: number) {
    const wishlist = await this.findOne(id);

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('You cannot delete this wishlist');
    }

    return this.wishlistsRepository.remove(wishlist);
  }
}
