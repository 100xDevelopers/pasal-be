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

  /**
   * Find a store by its subdomain (for public storefront access)
   */
  async findBySubdomain(subdomain: string) {
    const store = await this.prisma.store.findUnique({
      where: { subdomain },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
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

  /**
   * Get products for a store by subdomain (public access)
   */
  async getStoreProducts(subdomain: string) {
    const store = await this.findBySubdomain(subdomain);

    return this.prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Check if a subdomain is available
   */
  async isSubdomainAvailable(subdomain: string): Promise<boolean> {
    // Check reserved list
    if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
      return false;
    }

    // Check database
    const count = await this.prisma.store.count({
      where: { subdomain: subdomain.toLowerCase() },
    });

    return count === 0;
  }

  /**
   * Create a new store for a user
   */
  async create(userId: string, createStoreDto: CreateStoreDto) {
    const subdomain = createStoreDto.subdomain.toLowerCase();

    // Validate subdomain availability
    const available = await this.isSubdomainAvailable(subdomain);
    if (!available) {
      throw new ConflictException(
        `Subdomain "${subdomain}" is already taken or reserved`,
      );
    }

    return this.prisma.store.create({
      data: {
        ...createStoreDto,
        subdomain,
        ownerId: userId,
      },
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
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.ownerId !== userId) {
      throw new ForbiddenException('You do not own this store');
    }

    return store;
  }

  /**
   * Update a store
   */
  async update(id: string, userId: string, updateStoreDto: UpdateStoreDto) {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.store.update({
      where: { id },
      data: updateStoreDto,
    });
  }

  /**
   * Delete a store
   */
  async remove(id: string, userId: string) {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.store.delete({
      where: { id },
    });
  }
}
