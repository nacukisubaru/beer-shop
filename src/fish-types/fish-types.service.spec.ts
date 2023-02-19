import { Test, TestingModule } from '@nestjs/testing';
import { FishTypesService } from './fish-types.service';

describe('FishTypesService', () => {
  let service: FishTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FishTypesService],
    }).compile();

    service = module.get<FishTypesService>(FishTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
