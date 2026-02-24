import { Test, TestingModule } from '@nestjs/testing';
import { RefsService } from './refs.service';

describe('RefsService', () => {
  let service: RefsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefsService],
    }).compile();

    service = module.get<RefsService>(RefsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
