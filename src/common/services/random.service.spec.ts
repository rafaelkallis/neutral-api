import { Test, TestingModule } from '@nestjs/testing';
import { RandomService } from './random.service';
import { ConfigService } from './config.service';

describe('RandomService', () => {
  let service: RandomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomService, ConfigService],
    }).compile();

    service = module.get<RandomService>(RandomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
