import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash, verify } from 'argon2';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly prisma: PrismaService) {}

  async CreateLocalUser(createUserDto: CreateUserDto) {
    this.logger.log(`Creating local user with email: ${createUserDto.email}`);
    const { password, ...user } = createUserDto;
    const hashedPassword = await this.hashPasswordOrToken(password);
    return await this.prisma.user.create({
      data: {
        password: hashedPassword,
        provider: 'LOCAL',
        ...user,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        provider: true,
      },
    });
  }

  async findByEmail(email: string) {
    this.logger.log(`Finding user by email: ${email}`);
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOne(userId: string) {
    this.logger.log(`Finding user by id : ${userId}`);
    return await this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async hashPasswordOrToken(password: string) {
    this.logger.log(`Hashing password/token`);
    return await hash(password);
  }

  async comparePasswordOrToken(plainPassword: string, hashedPassword: string) {
    this.logger.log(`Comparing password/tokens`);
    return await verify(hashedPassword, plainPassword);
  }
}
