import { Test, TestingModule } from '@nestjs/testing';
import { RolnestService } from './rolnest.service';

describe('RolnestService', () => {
  let service: RolnestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolnestService],
    }).compile();

    service = module.get<RolnestService>(RolnestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
