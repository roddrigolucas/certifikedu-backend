import { Test, TestingModule } from '@nestjs/testing';
import { SQSService } from './sqs.service';
import { SQSClient } from '@aws-sdk/client-sqs';
describe('Sqs', () => {
  let provider: SQSService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SQSService],
    }).compile();

    provider = module.get<SQSService>(SQSService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return AWS SQS client instance', () => {
    expect(provider.sqsClient).toBeDefined();
    expect(provider.sqsClient).toBeInstanceOf(SQSClient);
  });
});
