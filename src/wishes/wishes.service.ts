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
    const wish = this.wishesRepository.create({
      ...createWishDto,
      owner,
    });

    return this.wishesRepository.save(wish);
  }

  findAll() {
    return this.wishesRepository.find({
      relations: ['owner', 'offers'],
    });
  }

  findOne(query: FindOptionsWhere<Wish>) {
    return this.wishesRepository.findOne({
      where: query,
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
  async updateOne(
    query: FindOptionsWhere<Wish>,
    updateWishDto: UpdateWishDto,
    userId: number,
  ) {
    const wish = await this.wishesRepository.findOne({
      where: query,
    });
    if (!wish) throw new NotFoundException('Wish not found');

    if (wish.owner.id !== userId)
      throw new ForbiddenException('You are not the owner of this wish');

    if (wish.offers?.length > 0 && updateWishDto['price']) {
      throw new BadRequestException('Cannot change price after offers exist');
    }

    Object.assign(wish, updateWishDto);
    return await this.wishesRepository.save(wish);
  }

  async removeOne(query: FindOptionsWhere<Wish>, userId: number) {
    const wish = await this.wishesRepository.findOne({
      where: query,
    });
    if (!wish) throw new NotFoundException('Wish not found');

    if (wish.owner.id !== userId)
      throw new ForbiddenException('You are not the owner of this wish');

    return await this.wishesRepository.remove(wish);
  }
}
