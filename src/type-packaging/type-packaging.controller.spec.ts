import { Test, TestingModule } from '@nestjs/testing';
import { TypePackagingController } from './type-packaging.controller';
import { TypePackagingService } from './type-packaging.service';

describe('TypePackagingController', () => {
  let controller: TypePackagingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypePackagingController],
      providers: [TypePackagingService],
    }).compile();

    controller = module.get<TypePackagingController>(TypePackagingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
