import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333/');
  });

  afterAll(() => {
    app.close();
  });

  const idpf = 2;
  const idpj = 3;

  /*** Sign Up ADMIN */
  describe('signIn ADMIN', () => {
    const adminLogin = {
      email: 'admin@certifikedu.com',
      password: 'Admin123!',
    };

    const pfUserLogin = {
      email: 'testepf@email.com',
      password: 'Teste123!',
    };
    const pjUserLogin = {
      email: 'testepj@email.com',
      password: 'Teste123!',
    };

    it('should sign admin in', () => {
      return pactum
        .spec()
        .post('auth/authenticate/cognito')
        .withBody(adminLogin)
        .expectStatus(200)
        .stores('adminAt', 'access_token');
    });

    it('should sign PF in', () => {
      return pactum
        .spec()
        .post('auth/authenticate/cognito')
        .withBody(pfUserLogin)
        .expectStatus(200)
        .stores('userPfAt', 'access_token');
    });

    it('should sign PJ in', () => {
      return pactum
        .spec()
        .post('auth/authenticate/cognito')
        .withBody(pjUserLogin)
        .expectStatus(200)
        .stores('userPjAt', 'access_token');
    });
  });

  // ***AUTHENTICATION FLUX***
  describe('Auth', () => {
    const PfUserDto = {
      email: 'userpfte2eteste@email.com',
      documentNumber: '10983654321',
      password: 'Teste123!',
      pfInfo: {
        nome: 'User Te2e',
        telefone: '5499887766',
        dataDeNascimento: '1993-12-12',
        cepNumber: '98765432',
        estado: 'SP',
        cidade: 'Sao Paulo',
        bairro: 'Iracema',
        rua: 'Rua das Nozes',
        numero: '100',
        complemento: 'Fundos',
      },
    };

    const PjUserDto = {
      email: 'userpjte2eteste1@email.com',
      documentNumber: '19876921000187',
      password: 'Teste123!',
      pjInfo: {
        razaoSocial: 'Latex Incorporated',
        nomeFantasia: 'Latexaria',
        dataDeFundacao: '1789-12-31',
        telefone: '6699112233',
        segmento: 'Industria',
        numeroDeFuncionarios: 200,
        socios: {
          CPF: '38467890123',
          nome: 'Vandeley',
          telefone: '+556699881234',
          dataDeNascimento: '1950-01-20',
          cepNumber: '76546578',
          estado: 'SP',
          cidade: 'Sao Paulo',
          bairro: 'Jurema',
          rua: 'Primeira Rua',
          numero: '120',
          complemento: 'apto 301',
        },
      },
    };

    //*** SIGNUP PESSOA FISICA ***
    describe('signUp Pessoa Fisica', () => {
      it('should throw if no body is provided', () => {
        return pactum.spec().post('auth/signup/pf').expectStatus(400);
      });

      it('should throw if email is empty', () => {
        const testDto = { ...PfUserDto };
        delete testDto.email;

        return pactum.spec().post('auth/signup/pf').withBody(testDto).expectStatus(400);
      });

      it('should throw if document number is empty', () => {
        const testDto = { ...PfUserDto };
        delete testDto.documentNumber;

        return pactum.spec().post('auth/signup/pf').withBody(testDto).expectStatus(400);
      });

      it('should throw if user info is missing', () => {
        const testDto = { ...PfUserDto };
        delete testDto.pfInfo;

        return pactum.spec().post('auth/signup/pf').withBody(testDto).expectStatus(400);
      });

      it('should throw if user info is incomplete', () => {
        const testDto = { ...PfUserDto };
        const testUserInfo = { ...testDto.pfInfo };
        delete testUserInfo.nome;

        testDto.pfInfo = testUserInfo;

        return pactum.spec().post('auth/signup/pf').withBody(testDto).expectStatus(400);
      });

      it('should throw if password does not conform to cognito rules', () => {
        const testDto = { ...PfUserDto };
        testDto.password = 'reste123!';

        return pactum.spec().post('auth/signup/pf').withBody(testDto).expectStatus(400);
      });

      it('should sign up PF', () => {
        return pactum.spec().post('auth/signup/pf').withBody(PfUserDto).expectStatus(201).stores('idpf', 'user.id');
      });

      it('should throw if credentials already in use', () => {
        return pactum.spec().post('auth/signup/pf').withBody(PfUserDto).expectStatus(400);
      });

      it('should delete user PF', () => {
        return pactum
          .spec()
          .delete('users/admin/delete/{id}')
          .withPathParams('id', '$S{idpf}')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .expectStatus(200);
      });
    });

    // **SIGN UP PESSOA JURIDICA***
    describe('signUp Pessoa Juridica', () => {
      it('should throw if no body is provided', () => {
        return pactum.spec().post('auth/signup/pj').expectStatus(400);
      });

      it('should throw if email is empty', () => {
        const testDto = { ...PjUserDto };
        delete testDto.email;

        return pactum.spec().post('auth/signup/pj').withBody(testDto).expectStatus(400);
      });

      it('should throw if document number is empty', () => {
        const testDto = { ...PjUserDto };
        delete testDto.documentNumber;

        return pactum.spec().post('auth/signup/pj').withBody(testDto).expectStatus(400);
      });

      it('should throw if user info is missing', () => {
        const testDto = { ...PjUserDto };
        delete testDto.pjInfo;

        return pactum.spec().post('auth/signup/pj').withBody(testDto).expectStatus(400);
      });

      it('should throw if user info is incomplete', () => {
        const testDto = { ...PjUserDto };
        const testPjInfo = { ...testDto.pjInfo };

        delete testPjInfo.nomeFantasia;

        testDto.pjInfo = testPjInfo;

        return pactum.spec().post('auth/signup/pj').withBody(testDto).expectStatus(400);
      });

      it('should throw if partner info is missing', () => {
        const testDto = { ...PjUserDto };
        const testPjInfo = { ...testDto.pjInfo };

        delete testPjInfo.socios;

        testDto.pjInfo = testPjInfo;

        return pactum.spec().post('auth/signup/pj').withBody(testDto).expectStatus(400);
      });

      it('should throw if partner info is incomplete', () => {
        const testDto = { ...PjUserDto };
        const testPjInfo = { ...testDto.pjInfo };
        const testSocios = { ...testPjInfo.socios };

        delete testSocios.CPF;

        testPjInfo.socios = testSocios;
        testDto.pjInfo = testPjInfo;

        return pactum.spec().post('auth/signup/pj').withBody(testDto).expectStatus(400);
      });

      it('should sign up', () => {
        return pactum.spec().post('auth/signup/pj').withBody(PjUserDto).expectStatus(201).stores('idpj', 'user.id');
      });

      it('should throw if credentials already in use', () => {
        return pactum.spec().post('auth/signup/pj').withBody(PjUserDto).expectStatus(400);
      });

      it('should delete user PJ', () => {
        return pactum
          .spec()
          .delete('users/admin/delete/{id}')
          .withPathParams('id', '$S{idpj}')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .expectStatus(200);
      });
    });
  });

  /** USERS TESTS */
  describe('Users', () => {
    /* GET MET */
    describe('Get me', () => {
      it('throw if token not provided', () => {
        return pactum.spec().get('users/whoami').expectStatus(401);
      });

      it('throw if wrong token provided', () => {
        return pactum
          .spec()
          .get('users/whoami')
          .withHeaders({
            Authorization: 'Bearer thistokenmakesnosense',
          })
          .expectStatus(401);
      });

      it('should get current user Admin', () => {
        return pactum
          .spec()
          .get('users/whoami')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .expectStatus(200);
      });

      it('should get current user PF', () => {
        return pactum
          .spec()
          .get('users/whoami')
          .withHeaders({
            Authorization: 'Bearer $S{userPfAt}',
          })
          .expectBodyContains('id')
          .expectStatus(200);
      });

      it('should get current user PJ', () => {
        return pactum
          .spec()
          .get('users/whoami')
          .withHeaders({
            Authorization: 'Bearer $S{userPjAt}',
          })
          .expectStatus(200);
      });
    });

    // 'Update Current PF Users info'
    describe('Update Current PF Users info', () => {
      it('should throw if no body', () => {
        return pactum
          .spec()
          .patch('users/update/pf/info')
          .withHeaders({
            Authorization: 'Bearer $S{userPfAt}',
          })
          .expectStatus(400);
      });

      it('should throw an error if token not especified', () => {
        return pactum.spec().patch('users/update/pf/info').expectStatus(401);
      });

      it('should throw if token is wrong', () => {
        return pactum
          .spec()
          .patch('users/update/pf/info')
          .withHeaders({
            Authorization: 'Bearer thistokenmakenosense',
          })
          .withBody({
            status: 'DISABLED',
          })
          .expectStatus(401);
      });

      it('should throw if field type is wrong', () => {
        return pactum
          .spec()
          .patch('users/update/pf/info')
          .withHeaders({
            Authorization: 'Bearer $S{userPfAt}',
          })
          .withBody({
            cidade: 12345,
          })
          .expectStatus(400);
      });

      it('should throw if user type is wrong', () => {
        return pactum
          .spec()
          .patch('users/update/pf/info')
          .withHeaders({
            Authorization: 'Bearer $S{userPjAt}',
          })
          .withBody({
            cidade: 'Maceio',
          })
          .expectStatus(400);
      });

      it('should update current user info', () => {
        return pactum
          .spec()
          .patch('users/update/pf/info')
          .withHeaders({
            Authorization: 'Bearer $S{userPfAt}',
          })
          .withBody({
            cidade: 'Erechim',
          })
          .expectStatus(200);
      });
    });

    // 'Update Current PJ Users info'
    describe('Update Current PJ Users info', () => {
      it('should throw if no body', () => {
        return pactum
          .spec()
          .patch('users/update/pj/info')
          .withHeaders({
            Authorization: 'Bearer $S{userPjAt}',
          })
          .expectStatus(400);
      });

      it('should throw an error if token not especified', () => {
        return pactum.spec().patch('users/update/pj/info').expectStatus(401);
      });

      it('should throw if token is wrong', () => {
        return pactum
          .spec()
          .patch('users/update/pj/info')
          .withHeaders({
            Authorization: 'Bearer thistokenmakenosense',
          })
          .withBody({
            nomeFantasia: 'DISABLED',
          })
          .expectStatus(401);
      });

      it('should throw if field type is wrong', () => {
        return pactum
          .spec()
          .patch('users/update/pj/info')
          .withHeaders({
            Authorization: 'Bearer $S{userPjAt}',
          })
          .withBody({
            nomeFantasia: 123987,
          })
          .expectStatus(400);
      });

      it('should throw if user type is wrong', () => {
        return pactum
          .spec()
          .patch('users/update/pj/info')
          .withHeaders({
            Authorization: 'Bearer $S{userPfAt}',
          })
          .withBody({
            nomeFantasia: 'Maceio',
          })
          .expectStatus(400);
      });

      it('should update current user info', () => {
        return pactum
          .spec()
          .patch('users/update/pj/info')
          .withHeaders({
            Authorization: 'Bearer $S{userPjAt}',
          })
          .withBody({
            nomeFantasia: 'Vandeley Industries',
          })
          .expectStatus(200);
      });
    });

    // Update Current Partner info
    describe('Update Current Partner info', () => {
      it('should throw if no body', () => {
        return pactum
          .spec()
          .patch('users/update/partner/info')
          .withHeaders({
            Authorization: 'Bearer $S{userPjAt}',
          })
          .expectStatus(400);
      });

      it('should throw an error if token not especified', () => {
        return pactum.spec().patch('users/update/partner/info').expectStatus(401);
      });

      it('should throw if token is wrong', () => {
        return pactum
          .spec()
          .patch('users/update/partner/info')
          .withHeaders({
            Authorization: 'Bearer thistokenmakenosense',
          })
          .withBody({
            cidade: 'Maceio',
          })
          .expectStatus(401);
      });

      it('should throw if field type is wrong', () => {
        return pactum
          .spec()
          .patch('users/update/partner/info')
          .withHeaders({
            Authorization: 'Bearer $S{userPjAt}',
          })
          .withBody({
            cidade: 123123,
          })
          .expectStatus(400);
      });

      it('should throw if user type is wrong', () => {
        return pactum
          .spec()
          .patch('users/update/partner/info')
          .withHeaders({
            Authorization: 'Bearer $S{userPfAt}',
          })
          .withBody({
            cidade: 'Maceio',
          })
          .expectStatus(400);
      });

      it('should update current user info', () => {
        return pactum
          .spec()
          .patch('users/update/partner/info')
          .withHeaders({
            Authorization: 'Bearer $S{userPjAt}',
          })
          .withBody({
            cidade: 'Maceio',
          })
          .expectStatus(200);
      });
    });

    // Update Other User info
    describe('Update Other User info', () => {
      it('should update a user', async () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: idpf,
            status: 'REVIEW',
          })
          .expectStatus(200);
      });

      it('should throw forbidden error when user not admin', async () => {
        pactum.handler.addDataFuncHandler('getInt', (ctx) => {
          const a = parseInt(ctx.args[0]);
          return a;
        });

        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{userPfAt}',
          })
          .withBody({
            userToUpdateId: '$S{idpj}',
            status: 'ENABLED',
          })
          .expectStatus(403);
      });

      it('should throw unauthorized error when updating if token not valid', async () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer thistokenmakesnosense',
          })
          .withBody({
            userToUpdateId: '$S{userToBeUpdated}',
            status: 'ENABLED',
          })
          .expectStatus(401);
      });

      it('should update a user', async () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: idpf,
            status: 'ENABLED',
          })
          .expectStatus(200);
      });
    });
  });

  describe('Update INFO Pessoa Fisica', () => {
    describe('Update Current PF User Info', () => {
      it('should throw unauthorized if not authenticated', () => {
        return pactum
          .spec()
          .patch('users/update/pf/info')
          .withHeaders({ Authorization: 'Bearer nonsensetoken' })
          .withBody({
            nome: 'Joaquinho',
          })
          .expectStatus(401);
      });

      it('should change status to review', () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: idpf,
            status: 'REVIEW',
          })
          .expectStatus(200);
      });

      it('should throw forbidden if user not enabled', () => {
        return pactum
          .spec()
          .patch('users/update/pf/info')
          .withHeaders({ Authorization: 'Bearer $S{userPfAt}' })
          .withBody({
            nome: 'Joaquinho',
          })
          .expectStatus(403);
      });

      it('should change status to enable', () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: idpf,
            status: 'ENABLED',
          })
          .expectStatus(200);
      });

      it('should throw if user is PJ', () => {
        return pactum
          .spec()
          .patch('users/update/pf/info')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .withBody({
            nome: 'Joaquinho',
          })
          .expectStatus(400);
      });

      it('should throw if body is empty', () => {
        return pactum
          .spec()
          .patch('users/update/pf/info')
          .withHeaders({ Authorization: 'Bearer $S{userPfAt}' })
          .expectStatus(400);
      });

      it('should update current', () => {
        return pactum
          .spec()
          .patch('users/update/pf/info')
          .withHeaders({ Authorization: 'Bearer $S{userPfAt}' })
          .withBody({
            nome: 'Joaquinho',
          })
          .expectStatus(200);
      });
    });

    describe('Update PF INFO via Admin', () => {
      it('should throw unathorized if token is invalid', () => {
        return pactum
          .spec()
          .patch('users/admin/update/pf/info')
          .withHeaders({ Authorization: 'Bearer token makes no sense' })
          .withBody({
            userToUpdateId: idpf,
            nome: 'jose da padaria',
          })
          .expectStatus(401);
      });

      it('should throw forbidden if user is not admin', () => {
        return pactum
          .spec()
          .patch('users/admin/update/pf/info')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .withBody({
            userToUpdateId: idpf,
            nome: 'jose da padaria',
          })
          .expectStatus(403);
      });

      it('should throw if no fields to be updated', () => {
        return pactum
          .spec()
          .patch('users/admin/update/pf/info')
          .withHeaders({ Authorization: 'Bearer $S{adminAt}' })
          .withBody({
            userToUpdateId: idpf,
          })
          .expectStatus(400);
      });

      it('should update a PF user Info', () => {
        return pactum
          .spec()
          .patch('users/admin/update/pf/info')
          .withHeaders({ Authorization: 'Bearer $S{adminAt}' })
          .withBody({
            userToUpdateId: idpf,
            nome: 'jose da padaria',
          })
          .expectStatus(200);
      });
    });
  });

  describe('Update INFO Pessoa Juridica', () => {
    describe('Update Current PJ User Info', () => {
      it('should throw unauthorized if not authenticated', () => {
        return pactum
          .spec()
          .patch('users/update/pj/info')
          .withHeaders({ Authorization: 'Bearer nonsensetoken' })
          .withBody({
            razaoSocial: 'Joaquinho',
          })
          .expectStatus(401);
      });

      it('should change status to review', () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: idpj,
            status: 'REVIEW',
          })
          .expectStatus(200);
      });

      it('should throw forbidden if user not enabled', () => {
        return pactum
          .spec()
          .patch('users/update/pj/info')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .withBody({
            razaoSocial: 'Joaquinho',
          })
          .expectStatus(403);
      });

      it('should change status to enable', () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: idpj,
            status: 'ENABLED',
          })
          .expectStatus(200);
      });

      it('should throw if user is PF', () => {
        return pactum
          .spec()
          .patch('users/update/pj/info')
          .withHeaders({ Authorization: 'Bearer $S{userPfAt}' })
          .withBody({
            razaoSocial: 'Joaquinho',
          })
          .expectStatus(400);
      });

      it('should throw if body is empty', () => {
        return pactum
          .spec()
          .patch('users/update/pj/info')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .expectStatus(400);
      });

      it('should update current', () => {
        return pactum
          .spec()
          .patch('users/update/pj/info')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .withBody({
            razaoSocial: 'Fabrica de carneiro',
          })
          .expectStatus(200);
      });
    });

    describe('Update PJ INFO via Admin', () => {
      it('should throw unathorized if token is invalid', () => {
        return pactum
          .spec()
          .patch('users/admin/update/pj/info')
          .withHeaders({ Authorization: 'Bearer token makes no sense' })
          .withBody({
            userToUpdateId: idpj,
            razaoSocial: 'padaria do jose',
          })
          .expectStatus(401);
      });

      it('should throw forbidden if user is not admin', () => {
        return pactum
          .spec()
          .patch('users/admin/update/pj/info')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .withBody({
            userToUpdateId: idpf,
            razaoSocial: 'padaria do jose',
          })
          .expectStatus(403);
      });

      it('should throw if no fields to be updated', () => {
        return pactum
          .spec()
          .patch('users/admin/update/pf/info')
          .withHeaders({ Authorization: 'Bearer $S{adminAt}' })
          .withBody({
            userToUpdateId: idpj,
          })
          .expectStatus(400);
      });

      it('should update a PF user Info', () => {
        return pactum
          .spec()
          .patch('users/admin/update/pj/info')
          .withHeaders({ Authorization: 'Bearer $S{adminAt}' })
          .withBody({
            userToUpdateId: idpj,
            razaoSocial: 'padaria do jose',
          })
          .expectStatus(200);
      });
    });
  });

  describe('Update Partner INFO', () => {
    describe('update current partner info', () => {
      it('should throw unauthorized if not authenticated', () => {
        return pactum
          .spec()
          .patch('users/update/partner/info')
          .withHeaders({ Authorization: 'Bearer nonsensetoken' })
          .withBody({
            razaoSocial: 'Joaquinho',
          })
          .expectStatus(401);
      });

      it('should change status to review', () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: idpj,
            status: 'REVIEW',
          })
          .expectStatus(200);
      });

      it('should throw forbidden if user not enabled', () => {
        return pactum
          .spec()
          .patch('users/update/partner/info')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .withBody({
            razaoSocial: 'Joaquinho',
          })
          .expectStatus(403);
      });

      it('should change status to enable', () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: idpj,
            status: 'ENABLED',
          })
          .expectStatus(200);
      });

      it('should throw if user is PF', () => {
        return pactum
          .spec()
          .patch('users/update/partner/info')
          .withHeaders({ Authorization: 'Bearer $S{userPfAt}' })
          .withBody({
            razaoSocial: 'Joaquinho',
          })
          .expectStatus(400);
      });

      it('should throw if body is empty', () => {
        return pactum
          .spec()
          .patch('users/update/partner/info')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .expectStatus(400);
      });

      it('should update current', () => {
        return pactum
          .spec()
          .patch('users/update/partner/info')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .withBody({
            CPF: '66556655665',
          })
          .expectStatus(200);
      });
    });

    describe('update partner INFO via admin', () => {
      it('should throw unathorized if token is invalid', () => {
        return pactum
          .spec()
          .patch('users/admin/update/partner/info')
          .withHeaders({ Authorization: 'Bearer token makes no sense' })
          .withBody({
            userToUpdateId: idpj,
            nome: 'dono da padaria do jose',
          })
          .expectStatus(401);
      });

      it('should throw not found if user is PF', () => {
        return pactum
          .spec()
          .patch('users/admin/update/partner/info')
          .withHeaders({ Authorization: 'Bearer $S{adminAt}' })
          .withBody({
            userToUpdateId: idpf,
            nome: 'dono da padaria do jose',
          })
          .expectStatus(404);
      });

      it('should throw forbidden if user is not admin', () => {
        return pactum
          .spec()
          .patch('users/admin/update/partner/info')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .withBody({
            userToUpdateId: idpj,
            nome: 'dono da padaria do jose',
          })
          .expectStatus(403);
      });

      it('should throw if no fields to be updated', () => {
        return pactum
          .spec()
          .patch('users/admin/update/partner/info')
          .withHeaders({ Authorization: 'Bearer $S{adminAt}' })
          .withBody({
            userToUpdateId: idpj,
          })
          .expectStatus(400);
      });

      it('should update a PF user Info', () => {
        return pactum
          .spec()
          .patch('users/admin/update/partner/info')
          .withHeaders({ Authorization: 'Bearer $S{adminAt}' })
          .withBody({
            userToUpdateId: idpj,
            nome: 'dono padaria do jose',
          })
          .expectStatus(200);
      });
    });

    //describe('Doc Pictures', () => {
    //  it('should create doc picture register', () => {});
    //
    //  it('should update doc picture register', () => {});
    //});
  });

  describe('Certificates', () => {
    describe('Create a Certificate', () => {
      describe('Create a single certificate', () => {
        it('should throw unauthorized if token not valid', () => {
          return pactum
            .spec()
            .post('certificates/create')
            .withHeaders({ Authorization: 'Bearer tokenmakesnosense' })
            .withBody({
              receptorDoc: '12000000001',
              name: 'primeiro cert',
              cargaHoraria: 100,
              habilidades: ['python', 'asodjh'],
            })
            .expectStatus(401);
        });

        it('should change status to review', () => {
          return pactum
            .spec()
            .patch('users/admin/update')
            .withHeaders({
              Authorization: 'Bearer $S{adminAt}',
            })
            .withBody({
              userToUpdateId: idpj,
              status: 'REVIEW',
            })
            .expectStatus(200);
        });

        it('should throw forbidden if user not enabled', () => {
          return pactum
            .spec()
            .post('certificates/create')
            .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
            .withBody({
              receptorDoc: '12000000001',
              name: 'primeiro cert',
              cargaHoraria: 100,
              habilidades: ['python', 'asodjh'],
            })
            .expectStatus(403);
        });

        it('should change status to enable', () => {
          return pactum
            .spec()
            .patch('users/admin/update')
            .withHeaders({
              Authorization: 'Bearer $S{adminAt}',
            })
            .withBody({
              userToUpdateId: idpj,
              status: 'ENABLED',
            })
            .expectStatus(200);
        });

        it('should throw error if body is missing', () => {
          return pactum
            .spec()
            .post('certificates/create')
            .withHeaders({ Authorization: 'Bearer $S{userPfAt}' })
            .expectStatus(400);
        });

        it('should throw if body is incomplete', () => {
          return pactum
            .spec()
            .post('certificates/create')
            .withHeaders({ Authorization: 'Bearer $S{userPfAt}' })
            .withBody({
              jibberjabber: '$S{idpj}',
            })
            .expectStatus(400);
        });

        it('should create a certificate with PJ user as Enabled', () => {
          return pactum
            .spec()
            .post('certificates/create')
            .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
            .withBody({
              receptorDoc: '12000000001',
              name: 'primeiro cert',
              cargaHoraria: 100,
              habilidades: ['python', 'asodjh'],
            })
            .expectJsonLike({ status: 'ENABLED' })
            .expectStatus(201);
        });

        it('should create a certificate with PF user as Review', () => {
          return pactum
            .spec()
            .post('certificates/create')
            .withHeaders({ Authorization: 'Bearer $S{userPfAt}' })
            .withBody({
              receptorDoc: '12000000001',
              name: 'SHDGFiupuhasd',
              cargaHoraria: 100,
              habilidades: ['python', 'asodjh'],
            })
            .expectJsonLike({ status: 'REVIEW' })
            .expectStatus(201);
        });

        describe('Associated Habilities', () => {
          it('should create certificate with empty habilities', () => {
            return pactum
              .spec()
              .post('certificates/create')
              .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
              .withBody({
                receptorDoc: '12000000001',
                name: 'primeiro cert',
                cargaHoraria: 100,
                habilidades: ['asodjh'],
              })
              .expectJsonLike({ habilidades: [] })
              .expectStatus(201);
          });

          it('should create certificate with accepted habilities', () => {
            return pactum
              .spec()
              .post('certificates/create')
              .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
              .withBody({
                receptorDoc: '12000000001',
                name: 'primeiro cert',
                cargaHoraria: 100,
                habilidades: ['python', 'sdljfhs'],
              })
              .expectJsonLike({ habilidades: ['python'] })
              .expectStatus(201);
          });
        });

        describe('Receptor Info', () => {
          it('should create a certificate with NO associated receptor', () => {
            return pactum
              .spec()
              .post('certificates/create')
              .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
              .withBody({
                receptorDoc: '12000000001',
                name: 'primeiro cert',
                cargaHoraria: 100,
                habilidades: ['python', 'sdljfhs'],
              })
              .expectJsonLike({ receptorId: null })
              .expectStatus(201)
              .stores('certId', 'certificateId');
          });

          it('should create a certificate with associated receptor', () => {
            return pactum
              .spec()
              .post('certificates/create')
              .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
              .withBody({
                receptorDoc: '12000000000',
                name: 'primeiro cert',
                cargaHoraria: 100,
                habilidades: ['python', 'sdljfhs'],
              })
              .expectJsonLike({ receptorId: 2 })
              .expectStatus(201)
              .stores('certRecId', 'certificateId');
          });
        });
      });
    });

    describe('Create multiple certificates', () => {
      it('should throw unauthorized if token not valid', () => {
        return pactum
          .spec()
          .post('certificates/create/many')
          .withHeaders({ Authorization: 'Bearer tokenmakesnosense' })
          .withBody({
            certificates: [
              {
                receptorDoc: '12000000001',
                name: 'primeiro cert',
                cargaHoraria: 100,
                habilidades: ['asodjh'],
              },
              {
                receptorDoc: '12312432412',
                name: 'teste de func20',
                cargaHoraria: 80,
                habilidades: ['typescript', 'asodjh'],
              },
            ],
          })
          .expectStatus(401);
      });

      it('should change status to review', () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: idpj,
            status: 'REVIEW',
          })
          .expectStatus(200);
      });

      it('should throw forbidden if user not enabled', () => {
        return pactum
          .spec()
          .post('certificates/create/many')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .withBody({
            certificates: [
              {
                receptorDoc: '12000000001',
                name: 'primeiro cert',
                cargaHoraria: 100,
                habilidades: ['asodjh'],
              },
              {
                receptorDoc: '12312432412',
                name: 'teste de func20',
                cargaHoraria: 80,
                habilidades: ['typescript', 'asodjh'],
              },
            ],
          })
          .expectStatus(403);
      });

      it('should change status to enable', () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: idpj,
            status: 'ENABLED',
          })
          .expectStatus(200);
      });

      it('should throw if body is missing', () => {
        return pactum
          .spec()
          .post('certificates/create/many')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .expectStatus(400);
      });

      it('should throw if body is incomplete', () => {
        return pactum
          .spec()
          .post('certificates/create/many')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .withBody({
            jibberjabber: idpj,
          })
          .expectStatus(400);
      });

      it('should throw if user is PF', () => {
        return pactum
          .spec()
          .post('certificates/create/many')
          .withHeaders({ Authorization: 'Bearer $S{userPfAt}' })
          .withBody({
            certificates: [
              {
                receptorDoc: '12000000001',
                name: 'primeiro cert',
                cargaHoraria: 100,
                habilidades: ['asodjh'],
              },
              {
                receptorDoc: '12312432412',
                name: 'teste de func20',
                cargaHoraria: 80,
                habilidades: ['typescript', 'asodjh'],
              },
            ],
          })
          .expectStatus(400);
      });

      it('should create many certificates', () => {
        return pactum
          .spec()
          .post('certificates/create/many')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .withBody({
            certificates: [
              {
                receptorDoc: '12000000001',
                name: 'primeiro cert',
                cargaHoraria: 100,
                habilidades: ['asodjh'],
              },
              {
                receptorDoc: '12312432412',
                name: 'teste de func20',
                cargaHoraria: 80,
                habilidades: ['typescript', 'asodjh'],
              },
            ],
          })
          .expectStatus(201);
      });
    });

    describe('Retrieve User Emitted Certificates', () => {
      it('should throw unauthorized if token not valid', () => {
        return pactum
          .spec()
          .get('certificates/user/emitted')
          .withHeaders({ Authorization: 'Bearer tokenmakesnosense' })
          .expectStatus(401);
      });

      it('should change user status to review', () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: idpj,
            status: 'REVIEW',
          })
          .expectStatus(200);
      });

      it('should throw forbidden if user not enabled', () => {
        return pactum
          .spec()
          .get('certificates/user/emitted')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .expectStatus(403);
      });

      it('should change user status to enable', () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: 3,
            status: 'ENABLED',
          })
          .expectStatus(200);
      });

      it('should return all users emitted certificates', () => {
        return pactum
          .spec()
          .get('certificates/user/emitted')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .expectStatus(200);
      });
    });

    describe('Retrieve User Own Certificates', () => {
      it('should throw unauthorized if token not valid', () => {
        return pactum
          .spec()
          .get('certificates/user')
          .withHeaders({ Authorization: 'Bearer tokenmakesnosense' })
          .expectStatus(401);
      });

      it('should change status to review', () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: idpj,
            status: 'REVIEW',
          })
          .expectStatus(200);
      });

      it('should throw forbidden if user not enabled', () => {
        return pactum
          .spec()
          .get('certificates/user')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .expectStatus(403);
      });

      it('should change status to enable', () => {
        return pactum
          .spec()
          .patch('users/admin/update')
          .withHeaders({
            Authorization: 'Bearer $S{adminAt}',
          })
          .withBody({
            userToUpdateId: idpj,
            status: 'ENABLED',
          })
          .expectStatus(200);
      });

      it('should return all users own certificates', () => {
        return pactum
          .spec()
          .get('certificates/user/emitted')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .expectStatus(200);
      });
    });

    describe('Retrieve Certificate Info', () => {
      it('should return certificate info', () => {
        return pactum
          .spec()
          .get('certificates/info/{id}')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .withPathParams('id', '$S{certId}')
          .expectStatus(200);
      });

      it('should return not found if certificate id does not exist', () => {
        return pactum
          .spec()
          .get('certificates/info/100000000')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .expectStatus(404);
      });
    });

    describe('Update a Certificate', () => {
      describe('Update User Certificate', () => {
        it('should throw unauthorized if token not valid', () => {
          return pactum
            .spec()
            .patch('certificates/update')
            .withHeaders({ Authorization: 'Bearer tokenmakesnosense' })
            .withBody({
              certificateId: '$S{certId}',
              status: 'ENABLED',
            })
            .expectStatus(401);
        });

        it('should change status to review', () => {
          return pactum
            .spec()
            .patch('users/admin/update')
            .withHeaders({
              Authorization: 'Bearer $S{adminAt}',
            })
            .withBody({
              userToUpdateId: idpj,
              status: 'REVIEW',
            })
            .expectStatus(200);
        });

        it('should throw forbidden if user not enabled', () => {
          return pactum
            .spec()
            .patch('certificates/update')
            .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
            .expectStatus(403);
        });

        it('should change status to enable', () => {
          return pactum
            .spec()
            .patch('users/admin/update')
            .withHeaders({
              Authorization: 'Bearer $S{adminAt}',
            })
            .withBody({
              userToUpdateId: idpj,
              status: 'ENABLED',
            })
            .expectStatus(200);
        });

        it('should throw if body is empty', () => {
          return pactum
            .spec()
            .patch('certificates/update')
            .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
            .expectStatus(400);
        });

        it('should throw if no info to update is provided', () => {
          return pactum
            .spec()
            .patch('certificates/update')
            .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
            .withBody({
              certificateId: '$S{certId}',
            })
            .expectStatus(400);
        });

        it('should throw if user is not emissor or receptor', () => {
          return pactum
            .spec()
            .patch('certificates/update')
            .withHeaders({ Authorization: 'Bearer $S{userPfAt}' })
            .withBody({
              certificateId: '$S{certId}',
              status: 'REVIEW',
            })
            .expectStatus(400);
        });

        it('should update a users certificate', () => {
          return pactum
            .spec()
            .patch('certificates/update')
            .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
            .withBody({
              certificateId: '$S{certId}',
              status: 'ENABLED',
              cargaHoraria: 25,
            })
            .expectStatus(200);
        });

        it('should disable a user certificate', () => {
          return pactum
            .spec()
            .patch('certificates/update')
            .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
            .withBody({
              certificateId: '$S{certId}',
              status: 'DISABLED',
            })
            .expectStatus(200);
        });
      });

      describe('Admin Update other users Certificate', () => {
        it('should throw unauthorized if token not valid', () => {
          return pactum
            .spec()
            .patch('certificates/admin/update')
            .withHeaders({ Authorization: 'Bearer tokenmakesnosense' })
            .withBody({
              certificateId: '$S{certId}',
              status: 'ENABLED',
            })
            .expectStatus(401);
        });

        it('should throw forbidden if user not admin', () => {
          return pactum
            .spec()
            .patch('certificates/admin/update')
            .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
            .withBody({
              certificateId: '$S{certId}',
              status: 'REVIEW',
            })
            .expectStatus(403);
        });

        it('should throw if body is empty', () => {
          return pactum
            .spec()
            .patch('certificates/admin/update')
            .withHeaders({ Authorization: 'Bearer $S{adminAt}' })
            .expectStatus(400);
        });

        it('should update a users certificate', () => {
          return pactum
            .spec()
            .patch('certificates/admin/update')
            .withHeaders({ Authorization: 'Bearer $S{adminAt}' })
            .withBody({
              certificateId: '$S{certId}',
              status: 'ENABLED',
            })
            .expectStatus(200);
        });
      });
    });

    describe('Admin can delete a Certificate', () => {
      it('should throw unauthorized if token not valid', () => {
        return pactum
          .spec()
          .delete('certificates/delete')
          .withHeaders({ Authorization: 'Bearer tokenmakesnosense' })
          .withBody({
            certificateId: '$S{certId}',
          })
          .expectStatus(401);
      });

      it('should throw forbidden if use not admin', () => {
        return pactum
          .spec()
          .delete('certificates/delete')
          .withHeaders({ Authorization: 'Bearer $S{userPjAt}' })
          .withBody({
            certificateId: '$S{certId}',
          })
          .expectStatus(403);
      });

      it('should throw if body is empty', () => {
        return pactum
          .spec()
          .delete('certificates/delete')
          .withHeaders({ Authorization: 'Bearer $S{adminAt}' })
          .expectStatus(400);
      });

      it('should delete a certificate', () => {
        return pactum
          .spec()
          .delete('certificates/delete')
          .withHeaders({ Authorization: 'Bearer $S{adminAt}' })
          .withBody({
            certificateId: '$S{certId}',
          })
          .expectStatus(200);
      });
    });

    //describe('Certificate Sharing', () => {
    //  it('should throw if certificate not enabled', () => {});
    //
    //  it('should throw if user not enabled', () => {});
    //
    //  it('should throw if certificate id not number', () => {});
    //
    //  it('should throw if certificate id does not exist', () => {});
    //
    //  it('should create certificate hash', () => {});
    //
    //  it('should retrieve certificate by hash', () => {});
    //
    //  it('should disable hash', () => {});
    //});
  });
});
