import { PrismaClient, PrismaPromise, User } from '@prisma/client';

interface IIds {
  userId: string;
  typeId: string;
}

export interface IUserData {
  admin: IIds;
  pf: IIds;
  pj: IIds;
  gui: IIds;
}

export async function createUsers(prisma: PrismaClient, userData: IUserData) {
  const querys: Array<PrismaPromise<User>> = [];
  querys.push(
    prisma.user.create({
      data: {
        id: userData.admin.userId,
        numeroDocumento: '10000000000',
        email: 'admin@certifikedu.com',
        type: 'PF',
        status: 'ADMIN',
        pessoaFisica: {
          create: {
            idPF: userData.admin.typeId,
            nome: 'Administrador',
            telefone: '6699887766',
            dataDeNascimento: new Date('1990-01-01'),
            cepNumber: '00000000',
            estado: 'RS',
            cidade: 'Porto Alegre',
            bairro: 'Iracema',
            rua: 'Juarema',
            numero: '1',
            complemento: 'fundos',
          },
        },
      },
    }),
  );

  querys.push(
    prisma.user.create({
      data: {
        id: userData.gui.userId,
        numeroDocumento: '02902055064',
        email: 'guil.dendena@gmail.com',
        type: 'PF',
        status: 'ADMIN',
        pessoaFisica: {
          create: {
            idPF: userData.gui.typeId,
            nome: 'Guilherme de Jesus',
            telefone: '54991493676',
            dataDeNascimento: new Date('1992-01-01'),
            cepNumber: '90690360',
            estado: 'RS',
            cidade: 'Porto Alegre',
            bairro: 'Petropolis',
            rua: 'Lagoinha',
            numero: '123',
            complemento: '',
          },
        },
      },
      include: { pessoaFisica: true },
    }),
  );

  querys.push(
    prisma.user.create({
      data: {
        id: userData.pf.userId,
        numeroDocumento: '28674819028',
        email: 'testepf@email.com',
        type: 'PF',
        status: 'ENABLED',
        pessoaFisica: {
          create: {
            idPF: userData.pf.typeId,
            nome: 'Juca Bala',
            telefone: '54991493676',
            dataDeNascimento: new Date('1992-01-01'),
            cepNumber: '90690360',
            estado: 'RS',
            cidade: 'Porto Alegre',
            bairro: 'Petropolis',
            rua: 'Lagoinha',
            numero: '123',
            complemento: '',
          },
        },
      },

      include: { pessoaFisica: true },
    }),
  );

  querys.push(
    prisma.user.create({
      data: {
        id: userData.pj.userId,
        numeroDocumento: '12300000000000',
        email: 'testepj@email.com',
        type: 'PJ',
        status: 'ENABLED',
        pessoaJuridica: {
          create: {
            idPJ: userData.pj.typeId,
            razaoSocial: 'Latex Incorporated',
            nomeFantasia: 'Latexaria',
            dataDeFundacao: new Date('1789-12-31'),
            telefone: '66999112233',
            segmento: 'Industria',
            numeroDeFuncionarios: 200,
            socios: {
              create: {
                CPF: '87589626510',
                nome: 'Jose Latexeiro',
                telefone: '+556699881234',
                dataDeNascimento: new Date('1950-01-20'),
                cepNumber: '76546578',
                estado: 'SP',
                cidade: 'Sao Paulo',
                bairro: 'Jurema',
                rua: 'Primeira Rua',
                numero: '120',
                complemento: 'apto 301',
              },
            },
          },
        },
      },
      include: { pessoaJuridica: true },
    }),
  );

  await prisma.$transaction(querys);
}
