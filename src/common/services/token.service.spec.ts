import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { RandomService } from './random.service';
import { ConfigService } from './config.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenService, RandomService, ConfigService],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
