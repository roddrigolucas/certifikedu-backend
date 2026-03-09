import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { PaymentsService } from '../payments/payments.service';
import { EmailsService } from '../emails/emails.service';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../aws/s3/s3.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('UsersService', () => {
  let usersService: UsersService;
  let databaseService: PrismaService;
  // let authService: AuthService;
  // let paymentService: PaymentsService;
  // let emailService: EmailsService;
  // let config: ConfigService;
  // let s3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            basicPlans: {
              findFirst: jest.fn(),
            },
            userPlans: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: PaymentsService,
          useValue: {
            createPayment: jest.fn(),
            getPayment: jest.fn(),
          },
        },
        {
          provide: EmailsService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();
    usersService = module.get<UsersService>(UsersService);
    databaseService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('should create user subscription', async () => {
    const findBasicPlanSpy = jest
      .spyOn(databaseService.basicPlans, 'findFirst')
      .mockResolvedValueOnce({ planId: 'any' } as any);

    const createUserPlanSpy = jest
      .spyOn(databaseService.userPlans, 'create')
      .mockResolvedValueOnce({ data: 'any' } as any);

    await usersService.createUserSubscription({
      id: 'fake-user-id',
    } as any);
    // expect(createdUserSubscription).toBeDefined();
    expect(findBasicPlanSpy).toHaveBeenCalled();
    expect(createUserPlanSpy).toHaveBeenCalled();
  });

  it('should not create user subscription if basic plan is not found', async () => {
    const findBasicPlanSpy = jest.spyOn(databaseService.basicPlans, 'findFirst').mockResolvedValueOnce(undefined);
    const createUserPlanSpy = jest
      .spyOn(databaseService.userPlans, 'create')
      .mockResolvedValueOnce({ data: 'any' } as any);

    const result = await usersService.createUserSubscription({
      id: 'fake-user-id',
    } as any);
    expect(result).toBeNull();
    expect(findBasicPlanSpy).toHaveBeenCalled();
    expect(createUserPlanSpy).not.toHaveBeenCalled();
  });
});
