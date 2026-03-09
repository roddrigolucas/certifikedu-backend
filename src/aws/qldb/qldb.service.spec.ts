import { Test, TestingModule } from '@nestjs/testing';
import { QldbService } from './qldb.service';
import { QldbDriver } from 'amazon-qldb-driver-nodejs';
import { ConfigService } from '@nestjs/config';

describe('QldbService', () => {
  let service: QldbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QldbService, ConfigService],
    }).compile();

    service = module.get<QldbService>(QldbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have an instance of AWS qldb driver', () => {
    expect(service.qldbDriver).toBeDefined();
    expect(service.qldbDriver).toBeInstanceOf(QldbDriver);
  });
});
