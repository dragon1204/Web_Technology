<<<<<<< HEAD
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PBaseService } from 'src/base/services/base.service';
import { User } from '@prisma/client';
=======
import { PBaseService } from "src/base/services/base.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Role, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb

@Injectable()
export class UsersService extends PBaseService<User> {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.user);
    }

<<<<<<< HEAD
    async createUser(data: CreateUserDto) {
        console.log("📝 UsersService.createUser called with:", JSON.stringify(data, null, 2));
        try {
            // Loại bỏ password nếu undefined để Prisma dùng default
            const userData: any = { ...data };
            if (userData.password === undefined) {
                delete userData.password;
            }
            const result = await this.create(userData);
            console.log("✅ User created successfully:", result.email, "ID:", result.id);
            return result;
        } catch (error) {
            console.error("❌ Error creating user:", error);
            throw error;
        }
=======
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
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
    }

    async findAllUsers() {
        return await this.findAll();
    }

<<<<<<< HEAD
    async findUserById(id: number) {
        return await this.findById(id);
    }

=======
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
    async findUserByEmail(email: string) {
        return await this.model.findUnique({ where: { email } });
    }

    async updateUser(id: number, data: UpdateUserDto) {
<<<<<<< HEAD
        console.log("🔄 UsersService.updateUser called for ID:", id, "with data:", JSON.stringify(data, null, 2));
        try {
            await this.findById(id);
            const result = await this.model.update({ where: { id }, data });
            console.log("✅ User updated successfully:", result.email);
            return result;
        } catch (error) {
            console.error("❌ Error updating user:", error);
            throw error;
        }
=======
        return await this.updateById(id, data);
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
    }

    async deleteUser(id: number) {
        return this.deleteById(id);
    }
<<<<<<< HEAD

    async checkId(id : number){
        try {
            await this.findById(id);
            return true;
        } catch {
            return false;
        }
    }
}
=======
}
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
