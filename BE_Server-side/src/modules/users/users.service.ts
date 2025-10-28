import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async createUser(data: CreateUserDto) {
        return await this.prisma.user.create({ data });
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
        if (!this.checkId(id)) {
            console.log("UserId ", id, "khong ton tai");
        }
        else 
            return this.prisma.user.update({ where: { id }, data });
    }

    async deleteUser(id: number) {
        return this.prisma.user.delete({ where: { id } });
    }

    async checkId(id : number){
        const user =  this.prisma.user.findUnique({where: { id }});
        if (!user)   return false;
        else return true;
    }
}
