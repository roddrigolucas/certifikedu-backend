import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
//import { PrismaService } from '../src/prisma/prisma.service';

import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { abilityInfo, addUserToSchool, certificateInfo, schoolInfo, studentInfo } from './api.objects';

describe('API e2e', () => {
  let app: INestApplication;
  //let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    //prisma = app.get(PrismaService);
    //await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333/');
    pactum.request.setDefaultTimeout(30 * 1000);
  });

  afterAll(() => {
    app.close();
  });

  /*** Sign Up */
  describe('signIn ADMIN', () => {
    const adminLogin = {
      email: 'admin@certifikedu.com',
      password: 'Admin123!',
    };

    const pjUserLogin = {
      email: 'testepj@email.com',
      password: 'Teste123!',
    };

    it('should sign admin in', () => {
      return pactum
        .spec()
        .post('auth/authenticate')
        .withBody(adminLogin)
        .expectStatus(200)
        .stores('adminAt', 'access_token');
    });

    it('should sign pj in', () => {
      return pactum
        .spec()
        .post('auth/authenticate')
        .withBody(pjUserLogin)
        .expectStatus(200)
        .stores('pjAt', 'access_token');
    });
  });

  /*** Get PJ Info*/
  describe('Get PJ Info', () => {
    it('should PJ Info', () => {
      return pactum
        .spec()
        .get('users/info')
        .withHeaders({
          Authorization: 'Bearer $S{pjAt}',
        })
        .expectStatus(200)
        .stores('pjId', 'response.data.userInfo.userId');
    });
  });

  /*** Manage Api */
  describe('API Permisions', () => {
    it('should enable user API', () => {
      return pactum
        .spec()
        .patch('api/v1/enable/$S{pjId}')
        .withHeaders({
          Authorization: 'Bearer $S{adminAt}',
        })
        .expectJson('success', true)
        .expectStatus(200);
    });

    it('should disable user API', () => {
      return pactum
        .spec()
        .patch('api/v1/disable/$S{pjId}')
        .withHeaders({
          Authorization: 'Bearer $S{adminAt}',
        })
        .expectJson('success', true)
        .expectStatus(200);
    });

    it('should enable user API', () => {
      return pactum
        .spec()
        .patch('api/v1/enable/$S{pjId}')
        .withHeaders({
          Authorization: 'Bearer $S{adminAt}',
        })
        .expectJson('success', true)
        .expectStatus(200);
    });
  });

  /*** Keys Api */
  describe('API Keys', () => {
    it('should create ApiKey', () => {
      return pactum
        .spec()
        .post('api/v1/create/key')
        .withHeaders({
          Authorization: 'Bearer $S{pjAt}',
        })
        .stores('keyCreatedAt', 'createdAt')
        .stores('keyUpdatedAt', 'updatedAt')
        .stores('apiKey', 'apiKey')
        .expectStatus(201);
    });

    it('should throw error if api Key already exists', () => {
      return pactum
        .spec()
        .post('api/v1/create/key')
        .withHeaders({
          Authorization: 'Bearer $S{pjAt}',
        })
        .expectStatus(400);
    });

    it('should retrieve ApiKey', () => {
      return pactum
        .spec()
        .get('api/v1/user/key/')
        .withHeaders({
          Authorization: 'Bearer $S{pjAt}',
        })
        .expectJson('createdAt', '$S{keyCreatedAt}')
        .expectJson('updatedAt', '$S{keyUpdatedAt}')
        .expectJson('apiKey', '$S{apiKey}')
        .expectStatus(200);
    });
  });

  describe('Schools', () => {
    it('should create School', async () => {
      return pactum
        .spec()
        .post('api/v1/school')
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .withBody(schoolInfo)
        .stores('schoolId', 'schoolId')
        .stores('schoolCnpj', 'schoolCnpj')
        .expectStatus(201);
    });

    it('should update School', () => {
      return pactum
        .spec()
        .patch('api/v1/school/$S{schoolId}')
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .expectStatus(200);
    });

    it('should get all user schools', () => {
      return pactum
        .spec()
        .get('api/v1/schools')
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .expectStatus(200);
    });

    it('should get school info by id', () => {
      return pactum
        .spec()
        .get('api/v1/schools/$S{schoolId}')
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .expectStatus(200);
    });
  });

  describe('ADMIN -- delete user', () => {
    it('should delete User', async () => {
      const response: { success: boolean } = await pactum
        .spec()
        .get(`admin/users/check/${studentInfo.email}`)
        .withHeaders({
          Authorization: 'Bearer $S{adminAt}',
        })
        .expectStatus(200)
        .returns((ctx) => {
          return { success: ctx.res.body.success };
        });

      if (response.success) {
        return pactum
          .spec()
          .delete(`admin/users/${studentInfo.email}`)
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .expectJson('success', true)
          .expectStatus(200);
      }
    });

    it('should get user not found', async () => {
      return pactum
        .spec()
        .get(`admin/users/check/${studentInfo.email}`)
        .withHeaders({
          Authorization: 'Bearer $S{adminAt}',
        })
        .expectJson('success', false)
        .expectStatus(200);
    });
  });

  describe('Users', () => {
    it('should create User', async () => {
      return pactum
        .spec()
        .post('api/v1/create/user')
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .withBody(studentInfo)
        .stores('studentId', 'userId')
        .inspect()
        .expectStatus(201);
    });

    it('should get all students', async () => {
      return pactum
        .spec()
        .get('api/v1/users')
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .expectStatus(200);
    });

    it('should get User info by Document', async () => {
      return pactum
        .spec()
        .get(`api/v1/user/${studentInfo.documentNumber}`)
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .expectStatus(200);
    });

    it('should add User to School', async () => {
      return pactum
        .spec()
        .patch(`api/v1/add/user/school`)
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .withBody({
          documentNumbers: addUserToSchool.documentNumbers,
          schoolId: '$S{schoolId}',
        })
        .expectStatus(200);
    });
  });

  describe('Abilities', () => {
    it('should get categories', async () => {
      return pactum
        .spec()
        .get(`api/v1/abilities/categories`)
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .stores('firstCategory', '[0].category')
        .expectStatus(200);
    });

    it('should get categorie abilities', async () => {
      return pactum
        .spec()
        .get(`api/v1/abilities/category/$S{firstCategory}`)
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .stores('firstAbilityId', '[0].abilityId')
        .stores('firstAbilityName', '[0].ability')
        .stores('firstAbilityCategory', '[0].category')
        .expectStatus(200);
    });

    it('should create Ability', async () => {
      return pactum
        .spec()
        .post(`api/v1/create/ability`)
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .withBody(abilityInfo)
        .expectJson('ability', abilityInfo.ability)
        .expectJson('category', abilityInfo.category)
        .stores('createdAbilityId', 'abilityId')
        .expectStatus(201);
    });

    it('should return existing Ability', async () => {
      return pactum
        .spec()
        .post(`api/v1/create/ability`)
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .withBody(abilityInfo)
        .expectJson('ability', abilityInfo.ability)
        .expectJson('category', abilityInfo.category)
        .expectJson('abilityId', '$S{createdAbilityId}')
        .expectStatus(201);
    });

    it('should get Ability by Id', async () => {
      return pactum
        .spec()
        .get(`api/v1/abilities/$S{firstAbilityId}`)
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .expectJson('ability', '$S{firstAbilityName}')
        .expectJson('category', '$S{firstAbilityCategory}')
        .expectJson('abilityId', '$S{firstAbilityId}')
        .expectStatus(200);
    });
  });

  describe('Certificates', () => {
    it('should create Certificate with existing abilities', async () => {
      const certificate = { ...certificateInfo };
      certificate.abilities = [
        {
          ability: abilityInfo.ability,
          category: abilityInfo.category,
        },
      ];

      return pactum
        .spec()
        .post(`api/v1/certificate`)
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .withBody(certificate)
        .expectStatus(201);
    }, 30000);

    it('should create Certificate with new ability', async () => {
      return pactum
        .spec()
        .post(`api/v1/certificate`)
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .withBody(certificateInfo)
        .expectStatus(201);
    }, 30000);

    it('should get all school Certificates', async () => {
      return pactum
        .spec()
        .get(`api/v1/school/certificates/${schoolInfo.schoolCnpj}`)
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .expectStatus(200);
    });

    it('should get all schools Certificates', async () => {
      return pactum
        .spec()
        .get(`api/v1/certificates/${studentInfo.documentNumber}`)
        .withHeaders({
          'ce-api-key': '$S{apiKey}',
        })
        .expectStatus(200);
    });
  });
});
