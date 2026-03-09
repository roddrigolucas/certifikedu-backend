import { Test, TestingModule } from '@nestjs/testing';
import { CognitoService } from './cognito.service';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';

describe('Cognito', () => {
  let provider: CognitoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CognitoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'AWS_COGNITO_USER_POOL_ID':
                  return 'us-east-1_RgRGghTSA';
                case 'AWS_COGNITO_CLIENT_ID':
                  return '3452llf39kf1lll6ltt36dfrbn';
                case 'AWS_COGNITO_FRONT_AUTH':
                  return '43f33ddcg5sca4l4dfgtl331dg';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<CognitoService>(CognitoService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return AWS Cognito client instance', () => {
    expect(provider.instanceClient).toBeDefined();
    expect(provider.instanceClient).toBeInstanceOf(CognitoIdentityProviderClient);
  });

  it('should return AWS Cognit Pool instance', () => {
    expect(provider.backUserPool).toBeDefined();
    expect(provider.backUserPool).toBeInstanceOf(CognitoUserPool);
  });

  it('should return AWS Cognit Pool instance', () => {
    expect(provider.frontUserPool).toBeDefined();
    expect(provider.frontUserPool).toBeInstanceOf(CognitoUserPool);
  });
});
