import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindProductDto } from './dto/find-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async findProducts(query: FindProductDto) {
    const {
      page = 1,
      limit = 10,
      shopId,
      category,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    const where: any = {
      isAvailable: true,
      stock: { gt: 0 },
      shop: {
        isActive: true,
      },
    };

    if (shopId) {
      where.shopId = shopId;
    }

    if (category) {
      where.vegetable = {
        category,
      };
    }

    if (search) {
      where.vegetable = {
        ...where.vegetable,
        name: {
          contains: search,
          mode: 'insensitive',
        },
      };
    }

    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = order;
    } else if (sortBy === 'name') {
      orderBy.vegetable = {
        name: order,
      };
    } else {
      orderBy.createdAt = order;
    }

    const [items, total] = await Promise.all([
      this.prisma.shopProduct.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          vegetable: true,
          garden: {
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
              description: true,
              isActive: true,
            },
          },
        },
      }),
      this.prisma.shopProduct.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findProductById(productId: number) {
    const product = await this.prisma.shopProduct.findUnique({
      where: { id: productId },
      include: {
        vegetable: true,
        garden: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    if (!product.isAvailable || product.stock === 0) {
      throw new NotFoundException('Sản phẩm hiện không có sẵn');
    }

    if (!product.shop.isActive) {
      throw new NotFoundException('Shop này chưa được kích hoạt');
    }

    return product;
  }

  async getProductsByShop(shopId: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Không tìm thấy shop');
    }

    if (!shop.isActive) {
      throw new NotFoundException('Shop này chưa được kích hoạt');
    }

    return this.prisma.shopProduct.findMany({
      where: {
        shopId,
        isAvailable: true,
        stock: { gt: 0 },
      },
      include: {
        vegetable: true,
        garden: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
