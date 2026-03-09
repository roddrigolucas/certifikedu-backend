import { Test, TestingModule } from '@nestjs/testing';
import { PdiService } from './pdi.service';

describe('PdiService', () => {
  let service: PdiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdiService],
    }).compile();

    service = module.get<PdiService>(PdiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
