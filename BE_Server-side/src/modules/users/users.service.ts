import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async createUser(data: CreateUserDto) {
        console.log("📝 UsersService.createUser called with:", JSON.stringify(data, null, 2));
        try {
            // Loại bỏ password nếu undefined để Prisma dùng default
            const userData: any = { ...data };
            if (userData.password === undefined) {
                delete userData.password;
            }
            const result = await this.prisma.user.create({ data: userData });
            console.log("✅ User created successfully:", result.email, "ID:", result.id);
            return result;
        } catch (error) {
            console.error("❌ Error creating user:", error);
            throw error;
        }
    }

    async findAllUsers() {
        return await this.prisma.user.findMany();
    }

    async findUserById(id: number) {
        return await this.prisma.user.findUnique({ where: { id } });
    }

    async findUserByEmail(email: string) {
        return await this.prisma.user.findUnique({ where: { email } });
    }

    async updateUser(id: number, data: UpdateUserDto) {
        console.log("🔄 UsersService.updateUser called for ID:", id, "with data:", JSON.stringify(data, null, 2));
        try {
            const userExists = await this.checkId(id);
            if (!userExists) {
                console.log("❌ UserId ", id, "khong ton tai");
                throw new Error(`User with ID ${id} not found`);
            }
            const result = await this.prisma.user.update({ where: { id }, data });
            console.log("✅ User updated successfully:", result.email);
            return result;
        } catch (error) {
            console.error("❌ Error updating user:", error);
            throw error;
        }
    }

    async deleteUser(id: number) {
        return this.prisma.user.delete({ where: { id } });
    }

    async checkId(id : number){
        const user = await this.prisma.user.findUnique({where: { id }});
        if (!user)   return false;
        else return true;
    }
}
