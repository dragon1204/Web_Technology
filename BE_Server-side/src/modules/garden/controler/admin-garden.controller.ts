import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AtGuard } from 'src/auth/guard/auth.guards';
import { RolesGuard } from 'src/auth/guard/roles.guards';
import { GardenService } from '../garden.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { GardenDto } from '../dto/garden.dto';
import { Role } from '@prisma/client';
import { ApiOperation } from '@nestjs/swagger';



@Controller('garden/admin')
@UseGuards(AtGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminGardenController {
    constructor(private readonly gardenService : GardenService){}

    @ApiOperation({ summary: "Used to create a garden" })
    @Post('')
    async createGarden(@Query() userId : number, @Body() dto: GardenDto){
        return this.gardenService.create(userId, dto);
    }

    @ApiOperation({ summary: "Used to get the list of the garden" })
    @Get('')
    async findMany(@Req() req){
        const user = req.user as {id: number; role:string}
        return this.gardenService.findMany(user.id, user.role);
    }

    @ApiOperation({ summary: "Used to get the detail of the garden" })
    @Get('/:id')
    async checkDetail(@Req() req, @Param('id') id : number){
        const user = req.user as {id : number; role: string};
        return this.gardenService.showDetail(user, id);
    }

    @ApiOperation({ summary: "Used to update the detail of the garden" })
    @Put('/:id')
    async updateGarden(@Body() garden: GardenDto, @Param('id') id : number,@Req() req ){
        return this.gardenService.update(garden, id, req.user);
    }


    @ApiOperation({ summary: "Used to delete the garden by id" })
    @Delete('/:id')
    async delete(@Param('id') id : number){
        return this.gardenService.delete(id);
    }
}
