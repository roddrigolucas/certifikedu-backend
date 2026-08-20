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
import { ResumesModule } from '../src/resumes/resumes.module';
import { LearningPathsModule } from '../src/learning-paths/path.module';

import redocExpressMiddleware from 'redoc-express';

const SWAGGER_UI_OPTIONS = {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    docExpansion: 'none',
    defaultModelsExpandDepth: 1,
  },
  customSiteTitle: 'CertifikEdu - Documentação Interativa da API',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .info .title { font-family: 'Inter', sans-serif; color: #1e293b; font-weight: 700 }
    .swagger-ui .btn.authorize { background-color: #2563eb; color: #ffffff; border-color: #2563eb; font-weight: 600 }
    .swagger-ui .btn.authorize svg { fill: #ffffff }
  `,
};

export const setupPlatformDocs = (app: INestApplication) => {
  const platformDocsConfig = new DocumentBuilder()
    .setTitle('CertifikEdu - Documentação da API')
    .setDescription(`
### 🎓 CertifikEdu Platform & Integration API

Esta é a **documentação interativa oficial** da plataforma CertifikEdu. Você pode testar e simular chamadas de API diretamente nesta página.

---

### 🔑 Como Autenticar e Testar na Prática:
1. Obtenha seu token JWT efetuando o login através da rota de Autenticação (\`/auth/login\` ou \`/pj/login\`).
2. Clique no botão **Authorize** 🔓 no canto superior direito desta documentação.
3. No campo **bearer (http, Bearer)**, digite seu token JWT no formato: \`Bearer SEU_TOKEN_AQUI\`.
4. Clique em **Authorize** e feche a janela modal.
5. Escolha qualquer endpoint abaixo, clique em **"Try it out"**, preencha os parâmetros e clique em **Execute** para ver a resposta em tempo real!

---
    `)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Insira seu token JWT no formato: Bearer <token>',
        in: 'header',
      },
      ('bearer'),
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Chave de API para integrações externas e webhooks',
      },
      'api-key',
    )
    .addTag('Auth', 'Autenticação, Login e Gestão de Sessão')
    .addTag('Institutional -- Learning Paths', 'Gestão de Trilhas de Aprendizagem (PJ)')
    .addTag('Institutional -- Resumes', 'Upload e Parse de Currículos com IA')
    .addTag('Institutional -- Certificates', 'Emissão e Gestão de Certificados')
    .addTag('Institutional -- Templates', 'Modelos e Templates de Certificados')
    .addTag('Institutional -- Students', 'Gestão de Alunos da Instituição')
    .addTag('Institutional -- Schools', 'Unidades de Ensino')
    .addTag('Institutional -- Courses', 'Cursos da Instituição')
    .build();

  const swaggerOptions: SwaggerDocumentOptions = {
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
    include: [
      AuthModule,
      TemplatesModule,
      AdminModule,
      UsersModule,
      AbilitiesModule,
      CertificatesModule,
      BlockchainModule,
      PdiModule,
      CandidateModule,
      PJInfoModule,
      PJUsersModule,
      CorporateModule,
      CanvasModule,
      PaymentsModule,
      CanvasPlatformModule,
      ResumesModule,
      LearningPathsModule,
    ],
  };

  const document = SwaggerModule.createDocument(app, platformDocsConfig, swaggerOptions);

  // Unified interactive Swagger UI routes for convenience
  SwaggerModule.setup('docs', app, document, SWAGGER_UI_OPTIONS);
  SwaggerModule.setup('api-docs', app, document, SWAGGER_UI_OPTIONS);
  SwaggerModule.setup('swagger/platform', app, document, SWAGGER_UI_OPTIONS);

  app.use(
    '/api-docs/platform-redoc',
    redocExpressMiddleware({
      title: 'CertifikEdu Platform API Documentation',
      specUrl: '/docs-json',
    }),
  );
};

export const setupApiDocs = (app: INestApplication) => {
  const apiDocsConfig = new DocumentBuilder()
    .setTitle('CertifikEdu Integration API')
    .setDescription('CertifikEdu External API for Third-Party Integrations')
    .setVersion('1.0.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Chave de API para integrações de terceiros',
      },
      'api-key',
    )
    .build();

  const swaggerOptions: SwaggerDocumentOptions = {
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
    include: [ApiModule],
  };

  const document = SwaggerModule.createDocument(app, apiDocsConfig, swaggerOptions);

  SwaggerModule.setup('swagger/api', app, document, SWAGGER_UI_OPTIONS);
};

export const setupDocs = (app: INestApplication) => {
  setupPlatformDocs(app);
  setupApiDocs(app);
};
