import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    try {
      const newUser = await this.usersService.create(createUserDto);

      delete newUser.password;

      return newUser;
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('User already exists');
      }
      throw err;
    }
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findOneWithPassword({ username });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    delete user.password;
    return user;
  }
}
