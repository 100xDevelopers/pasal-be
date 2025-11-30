import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateStoreDto } from './create-store.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateStoreDto extends PartialType(
  OmitType(CreateStoreDto, ['subdomain'] as const),
) {
  @ApiPropertyOptional({
    description: 'Whether the store is active and visible',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
