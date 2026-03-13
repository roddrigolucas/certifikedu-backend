import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AWSModule } from '../aws/aws.module';
import { PaymentsModule } from '../payments/payments.module';
import { EmailsModule } from '../emails/emails.module';
import { AuxModule } from '../_aux/_aux.module';
import { CoursesModule } from 'src/courses/courses.module';
import { SchoolsModule } from 'src/schools/schools.module';

@Module({
  imports: [AWSModule, AuxModule, PaymentsModule, EmailsModule, SchoolsModule, CoursesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
