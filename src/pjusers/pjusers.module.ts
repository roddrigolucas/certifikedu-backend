import { Module } from '@nestjs/common';
import { PJUsersController } from './pjusers.controller';
import { PJUsersService } from './pjusers.service';
import { AuthModule } from '../auth/auth.module';
import { AuxModule } from '../common/common.module';
import { AWSModule } from '../aws/aws.module';
import { UsersModule } from '../users/users.module';
import { AbilitiesModule } from 'src/abilities/abilities.module';

@Module({
  imports: [AuthModule, AuxModule, AWSModule, UsersModule, AbilitiesModule],
  controllers: [PJUsersController],
  providers: [PJUsersService],
  exports: [PJUsersService],
})
export class PJUsersModule {}
