import { Test, TestingModule } from '@nestjs/testing';
import { ResultatController } from './resultat.controller';

describe('ResultatController', () => {
  let controller: ResultatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResultatController],
    }).compile();

    controller = module.get<ResultatController>(ResultatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
