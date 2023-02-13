import { Test, TestingModule } from '@nestjs/testing';
import { FishController } from './fish.controller';
import { FishService } from './fish.service';

describe('FishController', () => {
  let controller: FishController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FishController],
      providers: [FishService],
    }).compile();

    controller = module.get<FishController>(FishController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
