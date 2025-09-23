import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminUsersController } from './admin.users.controller';
import { DatabaseModule } from '@/core/database/database.module';
import { LoggerModule } from '@/core/logger/logger.module';

@Module({
  imports: [DatabaseModule, LoggerModule],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
