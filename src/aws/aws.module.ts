import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SQSService } from './sqs/sqs.service';
import { S3Service } from './s3/s3.service';
import { SESService } from './ses/ses.service';
import { SecretManagerService } from './secrets-manager/secrets-manager.service';
import { QldbService } from './qldb/qldb.service';
import { CognitoService } from './cognito/cognito.service';
import { STSService } from './sts/sts.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION') || '7d' },
      }),
    }),
  ],
  providers: [SQSService, S3Service, SESService, SecretManagerService, QldbService, CognitoService, STSService],
  exports: [SQSService, S3Service, SESService, SecretManagerService, QldbService, CognitoService, STSService],
})
export class AWSModule { }
