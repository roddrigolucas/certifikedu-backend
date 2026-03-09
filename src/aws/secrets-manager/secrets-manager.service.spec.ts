import { Test, TestingModule } from '@nestjs/testing';
import { SecretManagerService } from './secrets-manager.service';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

describe('SecretManagerService', () => {
  let service: SecretManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecretManagerService],
    }).compile();

    service = module.get<SecretManagerService>(SecretManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return AWS Secret Manager client instance', () => {
    expect(service.secretManagerClient).toBeDefined();
    expect(service.secretManagerClient).toBeInstanceOf(SecretsManagerClient);
  });
});
