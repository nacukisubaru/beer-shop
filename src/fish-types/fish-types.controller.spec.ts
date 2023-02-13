import { Test, TestingModule } from '@nestjs/testing';
import { FishTypesController } from './fish-types.controller';
import { FishTypesService } from './fish-types.service';

describe('FishTypesController', () => {
  let controller: FishTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FishTypesController],
      providers: [FishTypesService],
    }).compile();

    controller = module.get<FishTypesController>(FishTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
