import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateStoreProductDto } from './dto/create-store-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '@src/auth/decorators/roles.decorator';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { Public } from '@src/auth/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Products')
@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ============================================
  // STORE-SCOPED PRODUCT ENDPOINTS
  // ============================================

  /**
   * Create a product for a specific store
   */
  @Post('stores/:storeId/products')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({
    summary: 'Create a product for a store',
    description:
      'Create a new product for a specific store (OWNER and MANAGER only)',
  })
  @ApiParam({
    name: 'storeId',
    description: 'Store ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
    schema: {
      example: {
        id: 'cm3xrh9qu0000kkj21l5m7m0z',
        storeId: 'clx1234567890',
        name: 'Wireless Mouse',
        category: 'Electronics',
        description: 'High-quality wireless mouse',
        price: 29.99,
        createdAt: '2025-11-27T12:00:00.000Z',
        updatedAt: '2025-11-27T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not own this store',
  })
  @ApiResponse({ status: 404, description: 'Store not found' })
  createForStore(
    @Param('storeId') storeId: string,
    @Body() createStoreProductDto: CreateStoreProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.productService.create(
      { ...createStoreProductDto, storeId },
      userId,
    );
  }

  /**
   * Get all products for a specific store (public)
   */
  @Public()
  @Get('stores/:storeId/products')
  @ApiOperation({
    summary: 'Get all products for a store',
    description: 'Retrieve all products for a specific store (public access)',
  })
  @ApiParam({
    name: 'storeId',
    description: 'Store ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products for the store',
  })
  findByStore(@Param('storeId') storeId: string) {
    return this.productService.findByStoreId(storeId);
  }

  // ============================================
  // USER'S PRODUCTS (across all their stores)
  // ============================================

  /**
   * Get all products owned by the current user (across all stores)
   */
  @Get('products/my-products')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my products',
    description:
      'Retrieve all products created by the authenticated user across all their stores',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user products with store info',
    schema: {
      example: [
        {
          id: 'cm3xrh9qu0000kkj21l5m7m0z',
          storeId: 'clx1234567890',
          name: 'Wireless Mouse',
          category: 'Electronics',
          description: 'High-quality wireless mouse',
          price: 29.99,
          createdAt: '2025-11-27T12:00:00.000Z',
          updatedAt: '2025-11-27T12:00:00.000Z',
          store: {
            id: 'clx1234567890',
            name: 'My Tech Store',
            subdomain: 'mytech',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyProducts(@CurrentUser('id') userId: string) {
    return this.productService.findByUserId(userId);
  }

  // ============================================
  // INDIVIDUAL PRODUCT OPERATIONS
  // ============================================

  /**
   * Get a single product by ID (public)
   */
  @Public()
  @Get('products/:id')
  @ApiOperation({
    summary: 'Get a product by ID',
    description: 'Retrieve a single product by its ID (public access)',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'cm3xrh9qu0000kkj21l5m7m0z',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details with store info',
    schema: {
      example: {
        id: 'cm3xrh9qu0000kkj21l5m7m0z',
        storeId: 'clx1234567890',
        name: 'Wireless Mouse',
        category: 'Electronics',
        description: 'High-quality wireless mouse',
        price: 29.99,
        createdAt: '2025-11-27T12:00:00.000Z',
        updatedAt: '2025-11-27T12:00:00.000Z',
        store: {
          id: 'clx1234567890',
          name: 'My Tech Store',
          subdomain: 'mytech',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  /**
   * Update a product
   */
  @Patch('products/:id')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({
    summary: 'Update a product',
    description:
      'Update an existing product (OWNER and MANAGER only, must own the store)',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'cm3xrh9qu0000kkj21l5m7m0z',
  })
  @ApiResponse({
    status: 200,
    description: 'Product successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not own this product',
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.productService.update(id, updateProductDto, userId);
  }

  /**
   * Delete a product
   */
  @Delete('products/:id')
  @ApiBearerAuth()
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Delete a product',
    description: 'Delete a product by ID (OWNER only, must own the store)',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'cm3xrh9qu0000kkj21l5m7m0z',
  })
  @ApiResponse({
    status: 200,
    description: 'Product successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only store OWNER can delete products',
  })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.productService.remove(id, userId);
  }

  // ============================================
  // LEGACY ENDPOINTS (for backward compatibility)
  // ============================================

  /**
   * Create a product (requires storeId in body)
   * @deprecated Use POST /stores/:storeId/products instead
   */
  @Post('product')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Create a new product (OWNER and MANAGER only). Requires storeId in body.',
    deprecated: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not own this store',
  })
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.productService.create(createProductDto, userId);
  }

  /**
   * Get all products
   * @deprecated Use GET /stores/:storeId/products for store-specific products
   */
  @Public()
  @Get('product')
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieve a list of all products across all stores',
    deprecated: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all products',
  })
  findAll() {
    return this.productService.findAll();
  }
}
