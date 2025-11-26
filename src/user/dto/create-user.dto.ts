import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'Sujal Don',
    minLength: 1,
  })
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'sujal.don@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: Role,
    example: Role.OWNER,
  })
  @IsEnum(Role)
  role: Role;
}
