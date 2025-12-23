import { Controller, Get, Post, Delete, Put, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AtGuard } from '../auth/guard/auth.guards';
import { RolesGuard } from '../auth/guard/roles.guards';
import { UserDto } from './dto/user.dto';
import { GetCurrentUser } from './decorator/getCurrentUser.decorator';

@ApiTags('Users Section')
@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(AtGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: "Chỉ Admin: Lấy danh sách toàn bộ người dùng" })
    @Get("")
    @Roles(Role.ADMIN)
    async findAllUsers() {
        return this.usersService.findAllUsers();
    }

    @ApiOperation({ summary: "Xem thông tin cá nhân (Profile cá nhân)" })
    @Get("me")
    async getMyProfile(@GetCurrentUser() user: any) {
        return this.usersService.findUserById(user.id);
    }

    @ApiOperation({ summary: "Admin tìm User theo ID hoặc User tự xem chính mình" })
    @Get("/:id")
    @Roles(Role.ADMIN, Role.USER) 
    async findUserById(
        @Param('id', ParseIntPipe) id: number,
        @GetCurrentUser() currentUser: any
    ) {
        return this.usersService.findUserByIdSecure(id, currentUser);
    }

    @ApiOperation({ summary: "Chỉ Admin: Tạo người dùng mới" })
    @Post('')
    @Roles(Role.ADMIN)
    async createUser(@Body() userData: UserDto) {
        return this.usersService.createUser(userData);
    }

    @ApiOperation({ summary: "Chỉ Admin: Cập nhật người dùng" })
    @Put("/:id")
    @Roles(Role.ADMIN)
    async updateUser(@Param('id', ParseIntPipe) id: number, @Body() userData: UserDto) {
        return this.usersService.updateUser(id, userData);
    }

    @ApiOperation({ summary: "Chỉ Admin: Xóa người dùng" })
    @Delete("/:id")
    @Roles(Role.ADMIN)
    async deleteUser(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.deleteUser(id);
    }
}