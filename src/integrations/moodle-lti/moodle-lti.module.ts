import { Module } from '@nestjs/common';
import { MoodleLtiController } from './moodle-lti.controller';
import { MoodleLtiService } from './moodle-lti.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, ConfigModule, JwtModule, HttpModule],
  controllers: [MoodleLtiController],
  providers: [MoodleLtiService]
})
export class MoodleLtiModule {}
