import { JoseJwtTokenManagerService } from 'token/infrastructure/JoseJwtTokenManagerService';
import { MockConfigService } from 'config/infrastructure/MockConfigService';

describe('JwtTokenService', () => {
  let config: MockConfigService;
  let jwtTokenService: JoseJwtTokenManagerService;

  beforeEach(() => {
    config = new MockConfigService();
    config.set(
      'SECRET_HEX',
      '3bdc741025576fa103f0fd755c88558a71586366e097943e1c1626c9ae8c04ed',
    );
    jwtTokenService = new JoseJwtTokenManagerService(config);
  });

  it('should be defined', () => {
    expect(jwtTokenService).toBeDefined();
  });
});
