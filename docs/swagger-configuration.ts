import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { AbilitiesModule } from '../src/abilities/abilities.module';
import { BlockchainModule } from '../src/blockchain/blockchain.module';
import { CertificatesModule } from '../src/certificates/certificates.module';
import { PaymentsModule } from '../src/payments/payments.module';
import { PJInfoModule } from '../src/pjinfo/pjinfo.module';
import { PJUsersModule } from '../src/pjusers/pjusers.module';
import { ApiModule } from '../src/api/api.module';
import { CandidateModule } from '../src/candidate/candidate.module';
import { CorporateModule } from '../src/corporate/corporate.module';
import { CanvasPlatformModule } from '../src/canvas/platform/canvas-platform.module';
import { CanvasModule } from '../src/canvas/canvas.module';
import { TemplatesModule } from '../src/templates/templates.module';
import { AdminModule } from '../src/admin/admin.module';
import { PdiModule } from '../src/pdi/pdi.module';

import redocExpressMiddleware from 'redoc-express';

export const setupPlatformDocs = (app: INestApplication) => {
  const platformDocsConfig = new DocumentBuilder()
    .setTitle('CertifikEdu Platform API')
    .setDescription('CertifikEdu Platform API Documentation')
    .setVersion('1.0.0')
    .build();

  const swaggerOptions: SwaggerDocumentOptions = {
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
    include: [
      // Public
      AuthModule,
      TemplatesModule,

      //Admin
      AdminModule,

      //PF User
      UsersModule,
      AbilitiesModule,
      CertificatesModule,
      BlockchainModule,
      PdiModule,
      CandidateModule,

      //Institutional
      PJInfoModule,

      //Corporate
      CorporateModule,

      //PJ
      PJUsersModule,
      CanvasModule,

      //Payments
      PaymentsModule,

      //Canvas
      CanvasPlatformModule,
    ],
  };

  const document = SwaggerModule.createDocument(app, platformDocsConfig, swaggerOptions);

  SwaggerModule.setup('swagger/platform', app, document);

  app.use(
    '/api-docs/platform',
    redocExpressMiddleware({
      title: 'CertifikEdu Platform API Documentation',
      specUrl: '/swagger/platform-json',
    }),
  );
};

export const setupApiDocs = (app: INestApplication) => {
  const apiDocsConfig = new DocumentBuilder()
    .setTitle('CertifikEdu API')
    .setDescription('CertifikEdu API Documentation')
    .setVersion('1.0.0')
    .build();

  const swaggerOptions: SwaggerDocumentOptions = {
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
    include: [ApiModule],
  };

  const document = SwaggerModule.createDocument(app, apiDocsConfig, swaggerOptions);

  SwaggerModule.setup('swagger/api', app, document);

  app.use(
    '/api-docs/api',
    redocExpressMiddleware({
      title: 'CertifikEdu API Documentation',
      specUrl: '/swagger/api-json',
    }),
  );
};

export const setupDocs = (app: INestApplication) => {
  setupPlatformDocs(app);
  setupApiDocs(app);
};
