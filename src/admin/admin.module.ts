//MODULES
import { Module } from '@nestjs/common';
import { BackgroundsModule } from '../backgrounds/backgrounds.module';
import { AWSModule } from '../aws/aws.module';
import { CredentialsModule } from '../credentials-api/credentials.module';
import { AbilitiesModule } from '../abilities/abilities.module';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';

//CONTROLLERS
import { UsersAdminController } from './controllers/users.controller';
import { LtiAdminController } from './controllers/lti.controller';
import { CertificatesModule } from '../certificates/certificates.module';
import { CertificatesAdminController } from './controllers/certificates.controller';
import { InternalPlansAdminController } from './controllers/internal-plans.controller';
import { PagarmePlansAdminController } from './controllers/plans.controller';
import { CredentialsAdminController } from './controllers/credentials.controller';
import { EmailsAdminController } from './controllers/emails.controller';
import { AbilitiesAdminController } from './controllers/abilities.controller';
import { BackgroundsAdminController } from './controllers/backgrounds.controller';
import { PagarmeSubscriptionAdminController } from './controllers/subscriptions.controller';
import { PagarmeOrdersAdminController } from './controllers/orders.controller';
import { PagarmeDiscountsAdminController } from './controllers/discounts.controller';
import { PagarmeIncrementsAdminController } from './controllers/increments.controller';
import { AuxModule } from '../_aux/_aux.module';
import { EmailsModule } from '../emails/emails.module';
import { RequestsModule } from '../requests/requests.module';

@Module({
  imports: [
    AWSModule,
    AuxModule,
    EmailsModule,
    RequestsModule,
    BackgroundsModule,
    CredentialsModule,
    AbilitiesModule,
    UsersModule,
    CertificatesModule,
    PaymentsModule,
  ],
  providers: [],
  controllers: [
    AbilitiesAdminController,
    BackgroundsAdminController,
    CredentialsAdminController,
    EmailsAdminController,
    UsersAdminController,
    LtiAdminController,
    CertificatesAdminController,
    InternalPlansAdminController,
    PagarmePlansAdminController,
    PagarmeSubscriptionAdminController,
    PagarmeOrdersAdminController,
    PagarmeDiscountsAdminController,
    PagarmeIncrementsAdminController,
  ],
})
export class AdminModule {}
