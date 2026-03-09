import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

//FILTERS
import { AllExceptionsFilter } from './errors/all-exceptions.filter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityTrackerInterceptor } from './auth/interceptors/activity-tracker.interceptor';

//MIDDLEWARES
import { RequestIdMiddleware } from './logger/request-id.middleware';
import { LoggerMiddleware } from './logger/logger.middleware';

//MODULES
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CertificatesModule } from './certificates/certificates.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controler';
import { AbilitiesModule } from './abilities/abilities.module';
import { PaymentsModule } from './payments/payments.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ApiModule } from './api/api.module';
import { EmailsModule } from './emails/emails.module';
import { TemplatesModule } from './templates/templates.module';
import { PJUsersModule } from './pjusers/pjusers.module';
import { PJInfoModule } from './pjinfo/pjinfo.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RequestsModule } from './requests/requests.module';
import { AppService } from './app.service';
import { OpenBadgeModule } from './openbadge/openbadge.module';
import { AWSModule } from './aws/aws.module';
import { AdminModule } from './admin/admin.module';
import { LoggerModule } from './logger/logger.module';
import { AlsModule } from './als/als.module';
import { HttpModule } from '@nestjs/axios';
import { CanvasModule } from './canvas/canvas.module';
import { CorporateModule } from './corporate/corporate.module';
import { CandidateModule } from './candidate/candidate.module';
import { CanvasPlatformModule } from './canvas/platform/canvas-platform.module';
import { AuxModule } from './aux/aux.module';
import { PagarmeModule } from './payments/pagarme/pagarme.module';
import { PdiModule } from './pdi/pdi.module';
import { ResumesModule } from './resumes/resumes.module';
import { LearningPathsModule } from './learning-paths/path.module';
import { EventsModule } from './events/events.module';
import { MetabaseModule } from './metabase/metabase.module';
import { InverseModule } from './inverse/inverse.module';

@Module({
  providers: [
    AppService,
    HttpModule,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityTrackerInterceptor,
    },
  ],
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    EmailsModule,
    AdminModule,
    AuthModule,
    ApiModule,
    UsersModule,
    PJInfoModule,
    OpenBadgeModule,
    TemplatesModule,
    CertificatesModule,
    RequestsModule,
    PrismaModule,
    PJUsersModule,
    BlockchainModule,
    AbilitiesModule,
    AWSModule,
    LoggerModule,
    AlsModule,
    CandidateModule,
    AuxModule,
    CorporateModule,
    CanvasModule,
    CanvasPlatformModule,
    PaymentsModule,
    PagarmeModule,
    PdiModule,
    ResumesModule,
    LearningPathsModule,
    EventsModule,
    MetabaseModule,
    InverseModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
