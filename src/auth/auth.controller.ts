import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { Public } from './decorators/public.decorator';
import type { AuthenticatedRequest } from './types/auth-user.type';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN');
    const accessTokenMaxAge = this.parseTimeToMs(jwtExpiresIn!);

    const refreshExpiresIn = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRES_IN',
    );
    const refreshTokenMaxAge = this.parseTimeToMs(refreshExpiresIn!);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: accessTokenMaxAge,
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: refreshTokenMaxAge,
      path: '/',
    });
  }

  private parseTimeToMs(time: string) {
    const unit = time.slice(-1);
    const value = parseInt(time.slice(0, -1));
    switch (unit) {
      case 'm': // access token
        return value * 60 * 1000;
      case 'd': // refresh token
        return value * 24 * 60 * 60 * 1000;
    }
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
  }

  @Public()
  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.registerUser(createUserDto);
    return user;
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(req.user.id);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return {
      id: result.id,
      email: result.email,
      name: result.name,
      role: result.role,
      provider: result.provider,
    };
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refreshToken(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshToken(req.user.id);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { id: result.id };
  }

  @Get('me')
  getCurrentUser(@Request() req: AuthenticatedRequest) {
    return this.authService.getCurrentUser(req.user.id);
  }

  @Post('logout')
  async signOut(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.signOut(req.user.id);
    this.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }
}
