import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto';

// Reserved subdomains that cannot be used
const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'app',
  'mail',
  'ftp',
  'cdn',
  'static',
  'dashboard',
  'login',
  'signup',
  'register',
  'account',
  'settings',
  'help',
  'support',
  'blog',
  'docs',
  'status',
];

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySubdomain(subdomain: string) {
    const store = await this.prisma.store.findUnique({
      where: { subdomain },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        products: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store "${subdomain}" not found`);
    }

    if (!store.isActive) {
      throw new ForbiddenException('This store is currently inactive');
    }

    return store;
  }

  async getStoreProducts(subdomain: string) {
    const store = await this.findBySubdomain(subdomain);
    return store.products;
  }

  async isSubdomainAvailable(subdomain: string): Promise<boolean> {
    if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
      return false;
    }

    const count = await this.prisma.store.count({
      where: { subdomain: subdomain.toLowerCase() },
    });

    return count === 0;
  }

  async create(userId: string, createStoreDto: CreateStoreDto) {
    const subdomain = createStoreDto.subdomain.toLowerCase();

    return this.prisma.$transaction(async (tx) => {
      if (RESERVED_SUBDOMAINS.includes(subdomain)) {
        throw new ConflictException(`Subdomain "${subdomain}" is reserved`);
      }

      const existing = await tx.store.findUnique({
        where: { subdomain },
      });

      if (existing) {
        throw new ConflictException(
          `Subdomain "${subdomain}" is already taken`,
        );
      }

      return tx.store.create({
        data: {
          ...createStoreDto,
          subdomain,
          ownerId: userId,
        },
      });
    });
  }

  /**
   * Get all stores owned by a user
   */
  async findAllByOwner(userId: string) {
    return this.prisma.store.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single store by ID (for owner)
   */
  async findOne(id: string, userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id, ownerId: userId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  /**
   * Update a store
   */
  async update(id: string, userId: string, updateStoreDto: UpdateStoreDto) {
    const store = await this.prisma.store.update({
      where: { id, ownerId: userId },
      data: updateStoreDto,
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  /**
   * Delete a store
   */
  async remove(id: string, userId: string) {
    return this.prisma.store.delete({
      where: { id, ownerId: userId },
    });
  }
}
