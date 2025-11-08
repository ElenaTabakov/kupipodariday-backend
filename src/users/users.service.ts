import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private sanitizeUser(user: User) {
    if (!user) return null;

    const safeUser = { ...user };
    delete safeUser.password;

    return safeUser;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password) {
      const saltRounds = 10;
      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );
    }

    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => this.sanitizeUser(user));
  }

  async findOne(query: FindOptionsWhere<User>): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: query });
    return this.sanitizeUser(user);
  }

  async updateOne(
    query: FindOptionsWhere<User>,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: query });
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async removeOne(query: FindOptionsWhere<User>): Promise<boolean> {
    const result = await this.usersRepository.delete(query);
    return result.affected > 0;
  }

  async findMany(query: string) {
    const users = await this.usersRepository.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
    });

    return users.map((user) => this.sanitizeUser(user));
  }

  async findOneWithPassword(
    query: FindOptionsWhere<User>,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: query,
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
      },
    });
  }
}
