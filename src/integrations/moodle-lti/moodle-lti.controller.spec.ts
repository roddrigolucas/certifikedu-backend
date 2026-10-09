import { Test, TestingModule } from '@nestjs/testing';
import { MoodleLtiController } from './moodle-lti.controller';

describe('MoodleLtiController', () => {
  let controller: MoodleLtiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoodleLtiController],
    }).compile();

    controller = module.get<MoodleLtiController>(MoodleLtiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
