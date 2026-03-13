import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AWSModule } from '../aws/aws.module';
import { LoggerModule } from '../logger/logger.module';
import { PaymentsModule } from '../payments/payments.module';
import { JwtStrategy } from './strategy';
import { CertificatesModule } from '../certificates/certificates.module';
import { AuxModule } from '../_aux/_aux.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuxModule,
    AWSModule,
    LoggerModule,
    PaymentsModule,
    CertificatesModule,
    TemplatesModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
