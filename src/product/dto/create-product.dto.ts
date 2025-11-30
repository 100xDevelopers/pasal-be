import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Store ID this product belongs to',
    example: 'clx1234567890',
  })
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Mouse',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'Product category',
    example: 'Electronics',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-quality wireless mouse with ergonomic design',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Product price',
    example: 29.99,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;
}
