import { JwtTokenService } from 'token/jwt-token-service';
import { Test } from '@nestjs/testing';
import { TokenModule } from 'token/token.module';
import { CONFIG, MockConfig } from 'config';

describe('JwtTokenService', () => {
  let jwtTokenService: JwtTokenService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TokenModule],
    })
      .overrideProvider(CONFIG)
      .useClass(MockConfig)
      .compile();

    jwtTokenService = module.get(JwtTokenService);
  });

  it('should be defined', () => {
    expect(jwtTokenService).toBeDefined();
  });
});
