import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SensorDataService } from './sensor-data.service';
import { AtGuard } from 'src/modules/auth/guard/auth.guards';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Sensor Data')
@ApiBearerAuth()
@Controller('sensor-data')
@UseGuards(AtGuard)
export class SensorController {
  constructor(private readonly sensorDataService: SensorDataService) {}

  @Get('sensor/:sensorId')
  @ApiOperation({ summary: 'Get sensor data by sensor ID' })
  findBySensor(
    @Param('sensorId', ParseIntPipe) sensorId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : 100;

    return this.sensorDataService.findBySensor(sensorId, start, end, limitNum);
  }

  @Get('sensor/:sensorId/statistics')
  @ApiOperation({ summary: 'Get sensor data statistics' })
  getStatistics(
    @Param('sensorId', ParseIntPipe) sensorId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.sensorDataService.getStatistics(sensorId, start, end);
  }
}

