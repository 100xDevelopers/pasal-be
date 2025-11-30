import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CreateStoreDto, UpdateStoreDto } from './dto';
import { Subdomain, IsSubdomain } from '@src/common/decorators';
import { Public } from '@src/auth/decorators/public.decorator';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';

@ApiTags('Stores')
@Controller()
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // ============================================
  // PUBLIC ENDPOINTS (Subdomain-based access)
  // ============================================

  /**
   * Get store info by subdomain (accessed via subdomain.pasal.com)
   */
  @Public()
  @Get('store')
  @ApiOperation({ summary: 'Get store by subdomain' })
  @ApiResponse({ status: 200, description: 'Store found' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async getStoreBySubdomain(
    @Subdomain() subdomain: string | null,
    @IsSubdomain() isSubdomain: boolean,
  ) {
    if (!isSubdomain || !subdomain) {
      throw new BadRequestException(
        'No store specified. Access via subdomain.',
      );
    }

    return this.storeService.findBySubdomain(subdomain);
  }

  /**
   * Get store products by subdomain
   */
  @Public()
  @Get('store/products')
  @ApiOperation({ summary: 'Get store products by subdomain' })
  @ApiResponse({ status: 200, description: 'Products returned' })
  async getStoreProducts(@Subdomain() subdomain: string | null) {
    if (!subdomain) {
      throw new BadRequestException('No store specified');
    }

    return this.storeService.getStoreProducts(subdomain);
  }

  /**
   * Check if a subdomain is available
   */
  @Public()
  @Get('stores/check-subdomain/:subdomain')
  @ApiOperation({ summary: 'Check if subdomain is available' })
  @ApiParam({ name: 'subdomain', description: 'Subdomain to check' })
  @ApiResponse({ status: 200, description: 'Returns availability status' })
  async checkSubdomain(@Param('subdomain') subdomain: string) {
    const available = await this.storeService.isSubdomainAvailable(subdomain);
    return { subdomain, available };
  }

  // ============================================
  // AUTHENTICATED ENDPOINTS (Store management)
  // ============================================

  /**
   * Create a new store
   */
  @Post('stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new store' })
  @ApiResponse({ status: 201, description: 'Store created' })
  @ApiResponse({ status: 409, description: 'Subdomain already taken' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createStoreDto: CreateStoreDto,
  ) {
    return this.storeService.create(userId, createStoreDto);
  }

  /**
   * Get all stores owned by the current user
   */
  @Get('stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all stores owned by current user' })
  @ApiResponse({ status: 200, description: 'Stores returned' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.storeService.findAllByOwner(userId);
  }

  /**
   * Get a specific store by ID
   */
  @Get('stores/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get store by ID' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiResponse({ status: 200, description: 'Store found' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.storeService.findOne(id, userId);
  }

  /**
   * Update a store
   */
  @Patch('stores/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a store' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiResponse({ status: 200, description: 'Store updated' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storeService.update(id, userId, updateStoreDto);
  }

  /**
   * Delete a store
   */
  @Delete('stores/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a store' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiResponse({ status: 200, description: 'Store deleted' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.storeService.remove(id, userId);
  }
}
