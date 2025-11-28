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
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '@src/auth/decorators/roles.decorator';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Create a new product (OWNER and MANAGER only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
    schema: {
      example: {
        id: 'cm3xrh9qu0000kkj21l5m7m0z',
        name: 'Wireless Mouse',
        category: 'Electronics',
        description: 'High-quality wireless mouse with ergonomic design',
        createdAt: '2025-11-27T12:00:00.000Z',
        updatedAt: '2025-11-27T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.productService.create(createProductDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieve a list of all products',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    schema: {
      example: [
        {
          id: 'cm3xrh9qu0000kkj21l5m7m0z',
          name: 'Wireless Mouse',
          category: 'Electronics',
          description: 'High-quality wireless mouse with ergonomic design',
          createdAt: '2025-11-27T12:00:00.000Z',
          updatedAt: '2025-11-27T12:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findAll() {
    return this.productService.findAll();
  }

  @Get('my-products')
  @ApiOperation({
    summary: 'Get my products',
    description: 'Retrieve all products created by the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user products',
    schema: {
      example: [
        {
          id: 'cm3xrh9qu0000kkj21l5m7m0z',
          userId: 'cm3xrh9qu0000kkj21l5m7m0a',
          name: 'Wireless Mouse',
          category: 'Electronics',
          description: 'High-quality wireless mouse with ergonomic design',
          createdAt: '2025-11-27T12:00:00.000Z',
          updatedAt: '2025-11-27T12:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findMyProducts(@CurrentUser('id') userId: string) {
    return this.productService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a product by ID',
    description: 'Retrieve a single product by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'cm3xrh9qu0000kkj21l5m7m0z',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    schema: {
      example: {
        id: 'cm3xrh9qu0000kkj21l5m7m0z',
        name: 'Wireless Mouse',
        category: 'Electronics',
        description: 'High-quality wireless mouse with ergonomic design',
        createdAt: '2025-11-27T12:00:00.000Z',
        updatedAt: '2025-11-27T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({
    summary: 'Update a product',
    description: 'Update an existing product (OWNER and MANAGER only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'cm3xrh9qu0000kkj21l5m7m0z',
  })
  @ApiResponse({
    status: 200,
    description: 'Product successfully updated',
    schema: {
      example: {
        id: 'cm3xrh9qu0000kkj21l5m7m0z',
        name: 'Updated Wireless Mouse',
        category: 'Electronics',
        description: 'Updated description',
        createdAt: '2025-11-27T12:00:00.000Z',
        updatedAt: '2025-11-27T13:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.productService.update(id, updateProductDto, userId);
  }

  @Delete(':id')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Delete a product',
    description: 'Delete a product by ID (OWNER only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'cm3xrh9qu0000kkj21l5m7m0z',
  })
  @ApiResponse({
    status: 200,
    description: 'Product successfully deleted',
    schema: {
      example: {
        id: 'cm3xrh9qu0000kkj21l5m7m0z',
        name: 'Wireless Mouse',
        category: 'Electronics',
        description: 'High-quality wireless mouse with ergonomic design',
        createdAt: '2025-11-27T12:00:00.000Z',
        updatedAt: '2025-11-27T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only OWNER can delete products',
  })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.productService.remove(id, userId);
  }
}
