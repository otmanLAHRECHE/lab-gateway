import { Test, TestingModule } from '@nestjs/testing';
import { RefsController } from './refs.controller';

describe('RefsController', () => {
  let controller: RefsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefsController],
    }).compile();

    controller = module.get<RefsController>(RefsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
