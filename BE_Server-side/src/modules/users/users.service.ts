import { PBaseService } from "src/base/services/base.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Role, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService extends PBaseService<User> {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.user);
    }

    async findUserById(userId: any) {
        return await this.findById(userId);
    }
    
    async findUserByIdSecure(targetId: number, currentUser: any) {
        if (currentUser.role !== Role.ADMIN && currentUser.id !== targetId) {
            throw new ForbiddenException('Bạn không có quyền xem thông tin người này');
        }
        return await this.findById(targetId);
    }

    async createUser(data: CreateUserDto) {
        const userData: any = { ...data };
        if (userData.password === undefined) {
            delete userData.password;
        }
        return await this.create(userData);
    }

    async findAllUsers() {
        return await this.findAll();
    }

    async findUserByEmail(email: string) {
        return await this.model.findUnique({ where: { email } });
    }

    async updateUser(id: number, data: UpdateUserDto) {
        return await this.updateById(id, data);
    }

    async deleteUser(id: number) {
        return this.deleteById(id);
    }
}