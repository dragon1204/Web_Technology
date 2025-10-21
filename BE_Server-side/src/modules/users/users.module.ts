import { Module } from '@nestjs/common';
// import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';


@Module({
  imports: [],
  controllers: [UsersController],
  providers: [ UsersService ],
  exports: [UsersService],
})
export class UsersModule {}
