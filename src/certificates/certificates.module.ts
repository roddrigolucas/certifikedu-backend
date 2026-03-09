import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller';
import { AWSModule } from '../aws/aws.module';
import { CertificatesService } from './certificates.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { OpenBadgeModule } from '../openbadge/openbadge.module';
import { RequestsModule } from '../requests/requests.module';
import { CandidateModule } from '../candidate/candidate.module';
import { AuxModule } from '../aux/aux.module';
import { AbilitiesModule } from '../abilities/abilities.module';
import { PaymentsModule } from '../payments/payments.module';
import { UsersModule } from '../users/users.module';
import { FontsModule } from 'src/fonts/fonts.module';
import { LearningPathsModule } from 'src/learning-paths/path.module';

@Module({
  imports: [
    AWSModule,
    BlockchainModule,
    OpenBadgeModule,
    RequestsModule,
    CandidateModule,
    AuxModule,
    AbilitiesModule,
    PaymentsModule,
    UsersModule,
    FontsModule,
    LearningPathsModule,
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
