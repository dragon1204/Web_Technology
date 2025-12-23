import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { GardenService } from './garden.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { GardenDto } from './dto/garden.dto';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AtGuard } from 'src/modules/auth/guard/auth.guards';
import { RolesGuard } from 'src/modules/auth/guard/roles.guards';
import { BQueryParams } from 'src/base/dto/base.dto';
import { GetCurrentUser } from '../users/decorator/getCurrentUser.decorator';

@ApiTags('Garden Section')
@Controller('garden')
@ApiBearerAuth('access-token')
@UseGuards(AtGuard, RolesGuard)
export class GardenController {
    constructor(private readonly gardenService: GardenService) {}

    @ApiOperation({ summary: "Admin tạo vườn cho User hoặc User tự tạo vườn" })
    @Post('')
    @Roles(Role.ADMIN, Role.USER)
    async create(
        @GetCurrentUser() user: any,
        @Body() dto: GardenDto,
        @Query('userId') targetUserId?: number
    ) {
        const ownerId = (user.role === Role.ADMIN && targetUserId) ? Number(targetUserId) : user.id;
        return this.gardenService.createGardenForUser(ownerId, dto);
    }

    @ApiOperation({ summary: "Lấy danh sách vườn (Admin thấy tất cả, User thấy của mình)" })
    @Get('')
    @Roles(Role.ADMIN, Role.USER)
    async findAll(
        @Query() query: BQueryParams, 
        @GetCurrentUser() user: any
    ) {
        return this.gardenService.findGardensSecure(query, user);
    }

    @ApiOperation({ summary: "Xem chi tiết vườn (Phải là chủ sở hữu hoặc Admin)" })
    @Get('/:id')
    @Roles(Role.ADMIN, Role.USER)
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetCurrentUser() user: any
    ) {
        return this.gardenService.findOneSecure(id, user);
    }

    @ApiOperation({ summary: "Cập nhật vườn (Phải là chủ sở hữu hoặc Admin)" })
    @Put('/:id')
    @Roles(Role.ADMIN, Role.USER)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: GardenDto,
        @GetCurrentUser() user: any
    ) {
        return this.gardenService.updateGardenSecure(id, dto, user);
    }

    @ApiOperation({ summary: "Xóa vườn (Chỉ Admin)" })
    @Delete('/:id')
    @Roles(Role.ADMIN)
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.gardenService.deleteById(id);
    }
}