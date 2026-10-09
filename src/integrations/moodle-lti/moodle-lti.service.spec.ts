import { Test, TestingModule } from '@nestjs/testing';
import { MoodleLtiService } from './moodle-lti.service';

describe('MoodleLtiService', () => {
  let service: MoodleLtiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoodleLtiService],
    }).compile();

    service = module.get<MoodleLtiService>(MoodleLtiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
