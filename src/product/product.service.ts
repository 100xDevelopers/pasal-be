import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verify the user owns the store
   */
  private async verifyStoreOwnership(storeId: string, userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    if (store.ownerId !== userId) {
      throw new ForbiddenException('You do not own this store');
    }

    return store;
  }

  async create(createProductDto: CreateProductDto, userId: string) {
    const { storeId, ...productData } = createProductDto;

    // Verify user owns the store
    await this.verifyStoreOwnership(storeId, userId);

    this.logger.log(
      `Creating product: ${productData.name} for store: ${storeId}`,
    );

    return await this.prisma.product.create({
      data: {
        ...productData,
        storeId,
      },
    });
  }

  async findAll() {
    this.logger.log(`Fetching all products`);
    return await this.prisma.product.findMany({
      include: {
        store: {
          select: { id: true, name: true, subdomain: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByStoreId(storeId: string) {
    this.logger.log(`Fetching products for store: ${storeId}`);
    return await this.prisma.product.findMany({
      where: { storeId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUserId(userId: string) {
    this.logger.log(`Fetching products for user: ${userId}`);
    return await this.prisma.product.findMany({
      where: {
        store: { ownerId: userId },
      },
      include: {
        store: {
          select: { id: true, name: true, subdomain: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    this.logger.log(`Fetching product with id: ${id}`);
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: { id: true, name: true, subdomain: true, ownerId: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    // Get the product and verify ownership
    const product = await this.findOne(id);

    if (product.store.ownerId !== userId) {
      throw new ForbiddenException('You do not own this product');
    }

    this.logger.log(`User ${userId} updating product with id: ${id}`);

    return await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string, userId: string) {
    // Get the product and verify ownership
    const product = await this.findOne(id);

    if (product.store.ownerId !== userId) {
      throw new ForbiddenException('You do not own this product');
    }

    this.logger.log(`User ${userId} removing product with id: ${id}`);

    return await this.prisma.product.delete({
      where: { id },
    });
  }
}
