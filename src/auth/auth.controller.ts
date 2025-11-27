import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { Public } from './decorators/public.decorator';
import type { AuthenticatedRequest } from './types/auth-user.type';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Authentication')
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
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with email and password',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        id: 'sfsfdasfdscvz',
        email: 'sujal@gmail.com',
        name: 'sujal don',
        role: 'OWNER',
        provider: 'LOCAL',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User with given email already exists',
  })
  async registerUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.registerUser(createUserDto);
    return user;
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticate user with email and password. Sets httpOnly cookies for access and refresh tokens.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    schema: {
      example: {
        id: 'sfsfdasfdscvz',
        email: 'sujal@gmail.com',
        name: 'sujal don',
        role: 'OWNER',
        provider: 'LOCAL',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or user not found',
  })
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
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Get new access and refresh tokens using the refresh token from cookies',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully refreshed',
    schema: {
      example: {
        id: 'cm3xrh9qu0000kkj21l5m7m0z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refreshToken(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshToken(req.user.id);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { id: result.id };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
    description: 'Retrieve the authenticated user information',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user information',
    schema: {
      example: {
        id: 'sfsfdasfdscvz',
        email: 'sujal@gmail.com',
        name: 'sujal don',
        role: 'OWNER',
        provider: 'LOCAL',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing access token',
  })
  getCurrentUser(@Request() req: AuthenticatedRequest) {
    return this.authService.getCurrentUser(req.user.id);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Logout the user by clearing refresh token from database and removing auth cookies',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
    schema: {
      example: {
        message: 'Logged out successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing access token',
  })
  async signOut(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.signOut(req.user.id);
    this.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }
}
