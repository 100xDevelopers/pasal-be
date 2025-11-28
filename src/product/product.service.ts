import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, userId: string) {
    this.logger.log(
      `Creating product: ${createProductDto.name} for user: ${userId}`,
    );
    return await this.prisma.product.create({
      data: {
        ...createProductDto,
        userId,
      },
    });
  }

  async findAll() {
    this.logger.log(`Fetching all products`);
    return await this.prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUserId(userId: string) {
    this.logger.log(`Fetching products for user: ${userId}`);
    return await this.prisma.product.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    this.logger.log(`Fetching product with id: ${id}`);
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    this.logger.log(`User ${userId} updating product with id: ${id}`);
    return await this.prisma.product.update({
      where: { id, userId },
      data: updateProductDto,
    });
  }

  async remove(id: string, userId: string) {
    this.logger.log(`User ${userId} removing product with id: ${id}`);
    return await this.prisma.product.delete({
      where: { id, userId },
    });
  }
}
