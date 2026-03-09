import { Test, TestingModule } from '@nestjs/testing';
import { SESService } from './ses.service';
import { SESClient } from '@aws-sdk/client-ses';

describe('SesService', () => {
  let service: SESService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SESService],
    }).compile();

    service = module.get<SESService>(SESService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return AWS SES client instance', () => {
    expect(service.sesClient).toBeDefined();
    expect(service.sesClient).toBeInstanceOf(SESClient);
  });
});
