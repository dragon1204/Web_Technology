import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BQueryParams } from '../dto/base.dto';

export class BaseController<T> {
  constructor(protected readonly baseService: T) {}

  @Get('/all')
  async findAll() {
    return (this.baseService as any).findAll();
  }

  @Get()
  @ApiQuery({ type: BQueryParams })
  async pagination(@Query() query: BQueryParams) {
    return (this.baseService as any).pagination(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'number' })
  async findOne(@Param('id') id: string) {
    return (this.baseService as any).findById(id);
  }

  @Post()
  @ApiBody({ type: 'CreateDto' as any })
  async create(@Body() createDto: any) {
    return (this.baseService as any).create(createDto);
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: 'number' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<any>) {
    return (this.baseService as any).updateById(id, updateDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: 'number' })
  async delete(@Param('id') id: string) {
    return (this.baseService as any).deleteById(id);
  }

  @Delete('many')
  async deleteMany(@Body() ids: number[]) {
    return (this.baseService as any).deleteMany(ids);
  }
}
