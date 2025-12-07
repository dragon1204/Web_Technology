import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PBaseService } from 'src/base/services/base.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService extends PBaseService<User> {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.user);
    }

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
    }

    async findAllUsers() {
        return await this.findAll();
    }

    async findUserById(id: number) {
        return await this.findById(id);
    }

    async findUserByEmail(email: string) {
        return await this.model.findUnique({ where: { email } });
    }

    async updateUser(id: number, data: UpdateUserDto) {
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
    }

    async deleteUser(id: number) {
        return this.deleteById(id);
    }

    async checkId(id : number){
        try {
            await this.findById(id);
            return true;
        } catch {
            return false;
        }
    }
}
