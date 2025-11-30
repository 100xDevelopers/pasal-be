import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({
    description:
      'Unique subdomain for the store (e.g., "mystore" for mystore.pasal.com)',
    example: 'mystore',
    minLength: 3,
    maxLength: 63,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(63)
  @Matches(/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/, {
    message:
      'Subdomain must be lowercase, start and end with alphanumeric characters, and can contain hyphens',
  })
  subdomain: string;

  @ApiProperty({
    description: 'Display name of the store',
    example: 'My Awesome Store',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Store description',
    example: 'We sell the best products in town!',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'URL to the store logo',
    example: 'https://example.com/logo.png',
  })
  @IsString()
  @IsOptional()
  logo?: string;
}
