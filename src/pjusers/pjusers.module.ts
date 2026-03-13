import { Module } from '@nestjs/common';
import { PJUsersController } from './pjusers.controller';
import { PJUsersService } from './pjusers.service';
import { AuthModule } from '../auth/auth.module';
import { AuxModule } from '../_aux/_aux.module';
import { AWSModule } from '../aws/aws.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, AuxModule, AWSModule, UsersModule],
  controllers: [PJUsersController],
  providers: [PJUsersService],
  exports: [PJUsersService],
})
export class PJUsersModule {}
