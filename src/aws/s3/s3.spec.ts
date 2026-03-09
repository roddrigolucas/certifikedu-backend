import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { S3Client } from '@aws-sdk/client-s3';
import { CustomLogger } from '../../logger/custom-logger.service';
import { AlsModule } from '../../als/als.module';
import { ConfigService } from '@nestjs/config';

describe('S3', () => {
  let provider: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AlsModule],
      providers: [S3Service, CustomLogger, ConfigService],
    }).compile();

    provider = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return AWS S3 client instance', () => {
    expect(provider.instanceClient).toBeDefined();
    expect(provider.instanceClient).toBeInstanceOf(S3Client);
  });
});
