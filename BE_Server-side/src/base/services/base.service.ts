import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import { BQueryParams } from '../dto/base.dto';

@Injectable()
export class PBaseService<T> {
  constructor(protected model: any) {}

  async findAll() {
    return await this.model.findMany();
  }

  async pagination(
    query: BQueryParams,
    relationFilter?: { field: string; value: any },
  ) {
    const {
      page,
      limit = 10,
      sortBy,
      order = 'desc',
      search,
      searchFields = [],
    } = query;

    if (!page) {
      throw new BadRequestException('Page is required');
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new BadRequestException('Page and limit must be numbers');
    }

    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const orderBy = sortBy ? { [sortBy]: order } : undefined;
    let where = {};

    if (
      relationFilter &&
      relationFilter.field &&
      relationFilter.value !== undefined
    ) {
      where = {
        [relationFilter.field]: relationFilter.value,
      };
    }

    if (search && searchFields.length > 0) {
      where = {
        ...where,
        OR: searchFields.map((field) => ({
          [field]: { contains: search, mode: 'insensitive' },
        })),
      };
    }

    const [items, total] = await Promise.all([
      this.model.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.model.count({ where }),
    ]);

    return {
      items,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    };
  }

  async find(key: string, value: any) {
    const where = {
      [key]: value,
    };
    return await this.model.findMany({ where });
  }

  async findOne(key: string, value: any) {
    const where = {
      [key]: value,
    };
    const result = await this.model.findFirst({ where });
    if (!result) {
      throw new NotFoundException('Not found');
    }
    return result;
  }

  async findById(id: number) {
    if (isNaN(id) || id < 1) {
      throw new BadRequestException('ID must be a positive number');
    }
    const result = await this.model.findUnique({
      where: { id },
    });

    if (!result) {
      throw new NotFoundException(`Not found id=${id}`);
    }

    return result;
  }

  async findByIds(ids: number[]) {
    if (
      !Array.isArray(ids) ||
      ids.some((id) => isNaN(Number(id)) || Number(id) < 1)
    ) {
      throw new BadRequestException(
        'IDs must be an array of positive numbers',
      );
    }

    const numericIds = ids.map((id) => Number(id));

    const result = await this.model.findMany({
      where: { id: { in: numericIds } },
    });

    if (!result) {
      throw new NotFoundException(`Not found ids=${ids}`);
    }

    return result;
  }

  async create(data: Partial<T>) {
    return await this.model.create({ data });
  }

  async updateById(id: number, data: Partial<T>) {
    if (isNaN(id) || id < 1) {
      throw new BadRequestException('ID must be a positive number');
    }
    // Check if entity exists before updating
    await this.findById(id);
    return await this.model.update({ where: { id }, data });
  }

  async deleteById(id: number) {
    if (isNaN(id) || id < 1) {
      throw new BadRequestException('ID must be a positive number');
    }
    await this.findById(id);
    return await this.model.delete({ where: { id } });
  }

  async deleteMany(ids: number[]) {
    if (!Array.isArray(ids) || ids.some((id) => isNaN(id) || id < 1)) {
      throw new BadRequestException(
        'IDs must be an array of positive numbers',
      );
    }
    return await this.model.deleteMany({ where: { id: { in: ids } } });
  }
}
