import { Test, TestingModule } from '@nestjs/testing';
import { TypePackagingService } from './type-packaging.service';

describe('TypePackagingService', () => {
  let service: TypePackagingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypePackagingService],
    }).compile();

    service = module.get<TypePackagingService>(TypePackagingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
