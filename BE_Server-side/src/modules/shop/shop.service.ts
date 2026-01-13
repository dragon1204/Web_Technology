import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { AddProductDto } from './dto/add-product.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async createShop(ownerId: number, dto: CreateShopDto) {
    return this.prisma.shop.create({
      data: {
        ...dto,
        ownerId,
      },
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
  }

  async findMyShops(ownerId: number) {
    return this.prisma.shop.findMany({
      where: { ownerId },
      include: {
        products: {
          include: {
            vegetable: true,
            garden: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findShopById(shopId: number, user: any) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        products: {
          where: { isAvailable: true },
          include: {
            vegetable: true,
            garden: true,
          },
        },
      },
    });

    if (!shop) {
      throw new NotFoundException('Không tìm thấy shop');
    }

    // Chỉ owner hoặc admin mới thấy shop chưa active
    if (!shop.isActive && user.role !== Role.ADMIN && shop.ownerId !== user.id) {
      throw new ForbiddenException('Shop này chưa được kích hoạt');
    }

    return shop;
  }

  async updateShop(shopId: number, ownerId: number, dto: UpdateShopDto, user: any) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Không tìm thấy shop');
    }

    if (shop.ownerId !== ownerId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền cập nhật shop này');
    }

    return this.prisma.shop.update({
      where: { id: shopId },
      data: dto,
    });
  }

  async addProduct(shopId: number, ownerId: number, dto: AddProductDto, user: any) {
    // Verify shop ownership
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Không tìm thấy shop');
    }

    if (shop.ownerId !== ownerId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền thêm sản phẩm vào shop này');
    }

    // Verify vegetable and garden exist
    const [vegetable, garden] = await Promise.all([
      this.prisma.vegetable.findUnique({ where: { id: dto.vegetableId } }),
      this.prisma.garden.findUnique({ where: { id: dto.gardenId } }),
    ]);

    if (!vegetable) {
      throw new NotFoundException('Không tìm thấy loại rau');
    }

    if (!garden) {
      throw new NotFoundException('Không tìm thấy vườn');
    }

    // Verify garden belongs to shop owner
    if (garden.ownerId !== ownerId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Vườn này không thuộc về bạn');
    }

    // Check if product already exists
    const existing = await this.prisma.shopProduct.findUnique({
      where: {
        shopId_vegetableId_gardenId: {
          shopId,
          vegetableId: dto.vegetableId,
          gardenId: dto.gardenId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Sản phẩm này đã tồn tại trong shop');
    }

    return this.prisma.shopProduct.create({
      data: {
        shopId,
        vegetableId: dto.vegetableId,
        gardenId: dto.gardenId,
        price: dto.price,
        stock: dto.stock,
        isAvailable: dto.isAvailable ?? true,
      },
      include: {
        vegetable: true,
        garden: true,
      },
    });
  }

  async updateProduct(shopId: number, productId: number, ownerId: number, dto: Partial<AddProductDto>, user: any) {
    const product = await this.prisma.shopProduct.findUnique({
      where: { id: productId },
      include: { shop: true },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    if (product.shopId !== shopId) {
      throw new BadRequestException('Sản phẩm không thuộc shop này');
    }

    if (product.shop.ownerId !== ownerId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền cập nhật sản phẩm này');
    }

    return this.prisma.shopProduct.update({
      where: { id: productId },
      data: dto,
      include: {
        vegetable: true,
        garden: true,
      },
    });
  }

  async deleteProduct(shopId: number, productId: number, ownerId: number, user: any) {
    const product = await this.prisma.shopProduct.findUnique({
      where: { id: productId },
      include: { shop: true },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    if (product.shopId !== shopId) {
      throw new BadRequestException('Sản phẩm không thuộc shop này');
    }

    if (product.shop.ownerId !== ownerId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền xóa sản phẩm này');
    }

    return this.prisma.shopProduct.delete({
      where: { id: productId },
    });
  }

  async getAllActiveShops() {
    return this.prisma.shop.findMany({
      where: { isActive: true },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Lấy danh sách rau có thể thêm vào shop (từ gardens của user)
   * @param ownerId - ID của user (garden manager)
   * @param shopId - ID của shop (optional, để loại trừ các rau đã có trong shop)
   * @returns Danh sách rau từ gardens của user, kèm thông tin garden
   */
  async getAvailableVegetables(ownerId: number, shopId?: number) {
    // Lấy tất cả gardens của user
    const gardens = await this.prisma.garden.findMany({
      where: { ownerId },
      include: {
        vegetables: {
          include: {
            vegetable: true,
          },
        },
      },
    });

    // Lấy danh sách shopProduct đã có trong shop (nếu shopId được cung cấp)
    const existingProducts = shopId
      ? await this.prisma.shopProduct.findMany({
          where: { shopId },
          select: {
            vegetableId: true,
            gardenId: true,
          },
        })
      : [];

    // Tạo Set để check nhanh
    const existingSet = new Set(
      existingProducts.map((p) => `${p.vegetableId}-${p.gardenId}`)
    );

    // Tổng hợp danh sách rau từ các gardens
    const vegetablesMap = new Map<
      number,
      {
        vegetable: any;
        gardens: Array<{ gardenId: number; gardenName: string; quantity: number }>;
      }
    >();

    gardens.forEach((garden) => {
      garden.vegetables.forEach((vg) => {
        const key = `${vg.vegetableId}-${garden.id}`;
        if (!existingSet.has(key)) {
          // Chưa có trong shop, thêm vào danh sách
          if (!vegetablesMap.has(vg.vegetableId)) {
            vegetablesMap.set(vg.vegetableId, {
              vegetable: vg.vegetable,
              gardens: [],
            });
          }
          vegetablesMap.get(vg.vegetableId)!.gardens.push({
            gardenId: garden.id,
            gardenName: garden.name,
            quantity: vg.quantity,
          });
        }
      });
    });

    // Chuyển Map thành Array
    return Array.from(vegetablesMap.values());
  }

  /**
   * Lấy danh sách sản phẩm trong shop với filter và pagination
   * @param shopId - ID của shop
   * @param ownerId - ID của owner (để verify quyền)
   * @param filters - Các filter: isAvailable, vegetableId, gardenId, search
   * @param pagination - Pagination: page, limit
   * @param user - User object (để check role)
   */
  async getShopProducts(
    shopId: number,
    ownerId: number,
    filters?: {
      isAvailable?: boolean;
      vegetableId?: number;
      gardenId?: number;
      search?: string;
    },
    pagination?: {
      page?: number;
      limit?: number;
    },
    user?: any
  ) {
    // Verify shop ownership
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Không tìm thấy shop');
    }

    if (shop.ownerId !== ownerId && user?.role !== Role.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền xem sản phẩm của shop này');
    }

    // Build where clause
    const where: any = {
      shopId,
    };

    if (filters?.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
    }

    if (filters?.vegetableId) {
      where.vegetableId = filters.vegetableId;
    }

    if (filters?.gardenId) {
      where.gardenId = filters.gardenId;
    }

    if (filters?.search) {
      where.OR = [
        {
          vegetable: {
            name: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        },
        {
          garden: {
            name: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    // Pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.shopProduct.count({ where });

    // Get products
    const products = await this.prisma.shopProduct.findMany({
      where,
      include: {
        vegetable: true,
        garden: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
