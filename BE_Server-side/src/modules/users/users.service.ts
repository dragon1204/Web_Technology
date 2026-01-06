import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Role, User } from "@prisma/client";
import { PBaseService } from "src/base/services/base.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService extends PBaseService<User> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.user);
  }

  async createUser(data: CreateUserDto) {
    const userData = { ...data };

    if (userData.password) {
      // Độ khó (saltRounds) thông thường là 10
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    } else {
      // Nếu không có password, xóa field để tránh lưu giá trị undefined/null
      delete userData.password;
    }

    // Gọi hàm create từ lớp cha
    return await super.create(userData);
  }

  async findAllUsers() {
    return await this.model.findMany({
      include: {
        gardens: {
          include: {
            vegetables: {
              include: {
                vegetable: true,
              },
            },
            sales: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findUserById(id: number) {
    return await super.findById(id);
  }

  async findUserByIdSecure(targetId: number, currentUser: any) {
    if (currentUser.role !== Role.ADMIN && currentUser.id !== targetId) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin người này');
    }
    return await this.findById(targetId);
  }

  async findUserByEmail(email: string) {
    return await this.model.findUnique({ where: { email } });
  }

  async updateUser(id: number, data: UpdateUserDto) {
    try {
      return await super.updateById(id, data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        console.log('UserId ', id, 'khong ton tai');
      }
      throw error;
    }
  }

  async deleteUser(id: number) {
    return await super.deleteById(id);
  }

  async checkId(id: number) {
    try {
      await super.findById(id);
      return true;
    } catch {
      return false;
    }
  }
}
