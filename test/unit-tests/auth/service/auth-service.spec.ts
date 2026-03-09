import { Test } from '@nestjs/testing';

import { AuthService } from '../../../../src/auth/auth.service';
import { PrismaService } from '../../../../src/prisma/prisma.service';
import { CognitoService } from '../../../../src/aws/cognito/cognito.service';
import { TemplatesService } from '../../../../src/templates/templates.service';
import { AuxService } from '../../../../src/aux/aux.service';
import { CertificatesService } from '../../../../src/certificates/certificates.service';
import { PaymentsService } from '../../../../src/payments/services/payments.service';
import { SESService } from '../../../../src/aws/ses/ses.service';

import { mockPrismaAuthService } from './mocks/services/prisma.mock';
import { mockTemplatesService } from './mocks/services/templates.mock';
import { mockCognitoService } from './mocks/services/cognito.mock';
import { mockAuxService } from './mocks/services/aux.mock';
import { mockCertificatesService } from './mocks/services/certificates.mock';
import { mockPaymentsService } from './mocks/services/payments.mock';
import { mockSESService } from './mocks/services/ses.mock';

import { authInputs, rawUserInput, rawUserResponseDictInput } from './objects/auth.inputs';
import { checkUserResponses, rawUsersResponses } from './objects/auth.responses';

describe('Auth Service Unit Tests', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaAuthService },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: TemplatesService, useValue: mockTemplatesService },
        { provide: AuxService, useValue: mockAuxService },
        { provide: CertificatesService, useValue: mockCertificatesService },
        { provide: PaymentsService, useValue: mockPaymentsService },
        { provide: SESService, useValue: mockSESService },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  it('should be instantiated', () => {
    expect(authService).toBeDefined();
  });

  describe('Check If User Exists', () => {
    describe('User Exists On DB', () => {
      it('Should return an Error message if document is found', async () => {
        const result = await authService.checkUser(authInputs.existingDocument, authInputs.nonExistingEmail);
        expect(result).toEqual(checkUserResponses.documentExistsResponse);
      });

      it('Should return an Error message if email is found', async () => {
        const result = await authService.checkUser(authInputs.nonExistingDocument, authInputs.existingEmail);
        expect(result).toEqual(checkUserResponses.emailExistsResponse);
      });
    });

    describe('User Does not Exist On DB', () => {
      it('Should Return `False`', async () => {
        const result = await authService.checkUser(authInputs.nonExistingDocument, authInputs.nonExistingEmail);
        expect(result).toEqual(checkUserResponses.userNotFoundResponse);
      });
    });
  });

  describe('Raw Users', () => {
    describe('Sign-up', () => {
      describe('Errors on Sign-up', () => {
        it('Should Return `False` if User Document Exists on DB', async () => {
          const userDataInput = { ...rawUserInput };
          userDataInput.numeroDocumento = authInputs.existingDocument;

          const userDataResponseInput = { ...rawUserResponseDictInput };
          userDataResponseInput.documentNumber = authInputs.existingDocument;

          const result = await authService.signUpRawUser(userDataInput, userDataResponseInput);
          expect(result).toEqual(rawUsersResponses.signUp.documentError);
        });

        it('Should Return `False` if User Email Exists on DB', async () => {
          const userDataInput = { ...rawUserInput };
          userDataInput.email = authInputs.existingEmail;

          const userDataResponseInput = { ...rawUserResponseDictInput };
          userDataResponseInput.email = authInputs.existingEmail;

          const result = await authService.signUpRawUser(userDataInput, userDataResponseInput);
          expect(result).toEqual(rawUsersResponses.signUp.emailError);
        });
      });

      describe('Success Sign-up', () => {
        it('Should Return User Info', async () => {
          const userDataInput = rawUserInput;
          const userDataResponseInput = rawUserResponseDictInput;
          const result = await authService.signUpRawUser(userDataInput, userDataResponseInput);
          expect(result).toEqual(rawUsersResponses.signUp.success);
        });
      });
    });

    describe('Reset Password', () => {
      it('Should return if unproper return from cognito', () => {});
      it('Should return if user not found on Cognito', () => {});
      it('Should return if user found on Cognito but not on DB', () => {});
      it('Should return if user found on Cognito and on DB as Raw', () => {});
      it('Should return if user found on Cognito and on DB as Full user', () => {});
    });
  });
});
