import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, owner: User) {
    const newWish = this.wishesRepository.create({
      ...createWishDto,
      owner,
      copied: 0,
      raised: 0,
    });

    return this.wishesRepository.save(newWish);
  }

  async findOne(query: FindOptionsWhere<Wish>) {
    const wish = await this.wishesRepository.findOne({
      where: query,
      relations: ['owner', 'offers'],
    });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    return wish;
  }

  findAll() {
    return this.wishesRepository.find({
      relations: ['owner', 'offers'],
    });
  }

  findMany(query: FindOptionsWhere<Wish>) {
    return this.wishesRepository.find({
      where: query,
      relations: ['owner', 'offers'],
    });
  }

  async findByIds(ids: number[]) {
    return this.wishesRepository.find({
      where: { id: In(ids) },
      relations: ['owner', 'offers'],
    });
  }

  async findLast() {
    return await this.wishesRepository.find({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: ['owner', 'offers'],
    });
  }

  async findTop() {
    return await this.wishesRepository.find({
      order: { copied: 'DESC' },
      take: 20,
      relations: ['owner', 'offers'],
    });
  }

  async updateOne(
    query: FindOptionsWhere<Wish>,
    updateWishDto: UpdateWishDto,
    userId: number,
  ) {
    const wish = await this.findOne(query);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('You are not the owner of this wish');
    }

    if ('raised' in updateWishDto) {
      delete updateWishDto.raised;
    }

    if (wish.offers?.length > 0 && updateWishDto.price) {
      throw new BadRequestException('Cannot change price after offers exist');
    }

    Object.assign(wish, updateWishDto);
    return this.wishesRepository.save(wish);
  }

  async removeOne(query: FindOptionsWhere<Wish>, userId: number) {
    const wish = await this.findOne(query);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('You are not the owner of this wish');
    }

    return this.wishesRepository.remove(wish);
  }

  async increaseRaised(id: number, amount: number): Promise<Wish> {
    const result = await this.wishesRepository.increment(
      { id },
      'raised',
      amount,
    );

    if (!result.affected) {
      throw new NotFoundException('Wish not found');
    }

    return this.findOne({ id });
  }

  async copyWish(id: number, user: User) {
    const wish = await this.findOne({ id });

    const newWish = this.wishesRepository.create({
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
      owner: user,
      copied: 0,
      raised: 0,
    });

    await this.wishesRepository.save(newWish);

    await this.wishesRepository.increment({ id }, 'copied', 1);

    return newWish;
  }
}
