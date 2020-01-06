import { RandomService } from './random.service';
import { TokenService } from './token.service';
import { DummyConfig } from 'config';

describe('TokenService', () => {
  let config: DummyConfig;
  let randomService: RandomService;
  let tokenService: TokenService;

  beforeEach(() => {
    config = new DummyConfig();
    randomService = new RandomService();
    tokenService = new TokenService(config, randomService);
  });

  it('should be defined', () => {
    expect(tokenService).toBeDefined();
  });
});
