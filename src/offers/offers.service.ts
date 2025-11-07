import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { WishesService } from 'src/wishes/wishes.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private wishesService: WishesService,
    private usersService: UsersService,
  ) {}

  async create(userId: number, dto: CreateOfferDto) {
    const user = await this.usersService.findOne({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const wish = await this.wishesService.findOne({
      id: dto.itemId,
    });

    if (!wish) throw new NotFoundException('Wish not found');

    if (wish.owner.id === userId) {
      throw new ForbiddenException('You cannot donate to your own wish');
    }

    if (wish.raised + dto.amount > wish.price) {
      throw new BadRequestException('Amount exceeds needed sum');
    }

    const offer = this.offersRepository.create({
      amount: dto.amount,
      hidden: dto.hidden ?? false,
      user,
      item: wish,
    });

    await this.wishesService.increaseRaised(wish.id, dto.amount);

    return this.offersRepository.save(offer);
  }

  findAll() {
    return this.offersRepository.find({
      relations: ['user', 'item'],
    });
  }

  async findOne(id: number) {
    const offer = await this.offersRepository.findOne({
      where: { id },
      relations: ['user', 'item'],
    });

    if (!offer) throw new NotFoundException('Offer not found');

    return offer;
  }

  async updateOne(id: number, userId: number, dto: UpdateOfferDto) {
    const offer = await this.findOne(id);

    if (offer.user.id !== userId) {
      throw new ForbiddenException('You cannot edit this offer');
    }

    if (dto.amount || dto.itemId) {
      throw new BadRequestException(
        'You cannot change amount or target wish of an offer',
      );
    }

    // ⛔ Разрешено менять только hidden
    if (dto.hidden !== undefined) {
      offer.hidden = dto.hidden;
    }

    return this.offersRepository.save(offer);
  }

  async removeOne(id: number, userId: number) {
    const offer = await this.findOne(id);

    if (offer.user.id !== userId) {
      throw new ForbiddenException('You cannot delete this offer');
    }

    await this.wishesService.increaseRaised(offer.item.id, -offer.amount);

    return this.offersRepository.remove(offer);
  }
}
