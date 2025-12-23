<<<<<<< HEAD
import { Controller, Get, Post, Delete, Put, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '@prisma/client';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AtGuard } from '../auth/guard/auth.guards';
import { RolesGuard } from '../auth/guard/roles.guards';
import { UserDto } from './dto/user.dto';

@ApiTags('Users Section')
@Controller('users')
@UseGuards( AtGuard, RolesGuard)// Use AuthGuard to protect the routes
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({summary:"Used to get the list of users"})
    @Get("")
    @Roles(Role.USER)
=======
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
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
    async findAllUsers() {
        return this.usersService.findAllUsers();
    }

<<<<<<< HEAD
    @ApiOperation({summary:"Used to find a user by Id"})
    @Get("/:id")
    @Roles(Role.USER)
    async findUserById(@Param('id') id: string) {
        return this.usersService.findUserById(+id);
    }     
    
    @ApiOperation({summary:"Used to find a user by email"})
    @Get("/:email")
    async findUserByEmail(@Param('email') email: string) {
        return this.usersService.findUserByEmail(email);
    } 

    @ApiOperation({summary:"Used to create a user"})
=======
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
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
    @Post('')
    @Roles(Role.ADMIN)
    async createUser(@Body() userData: UserDto) {
        return this.usersService.createUser(userData);
<<<<<<< HEAD
    }   

    @ApiOperation({summary:"Used to update a user with Id"})
    @Put("/:id")
    @Roles(Role.ADMIN)
    async updateUser(@Param('id') id: string, @Body() userData: UserDto) {
        return this.usersService.updateUser(+id, userData);
    }       

    @ApiOperation({summary:"Used to delete a user with Id"})
    @Delete("/:id")
    @Roles(Role.ADMIN)
    async deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(+id);
    }

}
=======
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
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
