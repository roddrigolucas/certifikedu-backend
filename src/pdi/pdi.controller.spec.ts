import { Test, TestingModule } from '@nestjs/testing';
import { PdiController } from './pdi.controller';

describe('PdiController', () => {
  let controller: PdiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdiController],
    }).compile();

    controller = module.get<PdiController>(PdiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
