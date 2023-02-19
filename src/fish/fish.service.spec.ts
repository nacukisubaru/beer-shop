import { Test, TestingModule } from '@nestjs/testing';
import { FishService } from './fish.service';

describe('FishService', () => {
  let service: FishService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FishService],
    }).compile();

    service = module.get<FishService>(FishService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
