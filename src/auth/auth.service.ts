import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { CreateUserDto } from '@src/user/dto/create-user.dto';
import { UserService } from '@src/user/user.service';
import { AuthUser, JwtPayload } from './types/auth-user.type';
import refreshConfig from './config/refresh.config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);
    if (user)
      throw new ConflictException('User with given email already exists!');
    return this.userService.CreateLocalUser(createUserDto);
  }

  async login(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRT = await this.userService.hashPasswordOrToken(refreshToken);
    const user = await this.userService.updateHashedRefreshToken(
      userId,
      hashedRT,
    );
    return {
      id: userId,
      accessToken,
      refreshToken,
      email: user.email,
      name: user.name,
      role: user.role,
      provider: user.provider,
    };
  }

  async validateLocalUser(email: string, password: string): Promise<AuthUser> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found!');

    if (!user.password) {
      throw new UnauthorizedException(
        'This account was created using Google Sign-In. Please login with Google.',
      );
    }

    const isPasswordMatched = await this.userService.comparePasswordOrToken(
      password,
      user.password,
    );
    if (!isPasswordMatched)
      throw new UnauthorizedException('Invalid Credentials!');
    return { id: user.id, role: user.role };
  }

  async validateJwtUser(userId: string): Promise<AuthUser> {
    this.logger.log(`Validating JWT user with ID: ${userId}`);
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    return { id: user.id, role: user.role };
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<AuthUser> {
    const user = await this.userService.findOne(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('User not found!');
    const isRTMatched = await this.userService.comparePasswordOrToken(
      refreshToken,
      user.refreshToken,
    );
    if (!isRTMatched) throw new UnauthorizedException('Invalid Refresh Token!');
    return { id: user.id, role: user.role };
  }

  async refreshToken(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRT = await this.userService.hashPasswordOrToken(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRT);
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: string) {
    const payload: JwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.refreshTokenConfig.secret,
        expiresIn: this.refreshTokenConfig.expiresIn,
      } as unknown as JwtSignOptions),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      provider: user.provider,
      refreshToken: user.refreshToken,
    };
  }

  async signOut(userId: string) {
    return await this.userService.updateHashedRefreshToken(userId, null);
  }
}
