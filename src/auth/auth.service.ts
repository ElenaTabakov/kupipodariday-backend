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
    const { email, password, ...rest } = createUserDto;

    const existingUser = await this.usersService.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltrounds = 10; //hash
    const hashedPassword = await bcrypt.hash(password, saltrounds);

    const newUser = await this.usersService.create({
      ...rest,
      email,
      password: hashedPassword,
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findOne({ username });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    const { password: _, ...result } = user;
    return result;
  }
}
