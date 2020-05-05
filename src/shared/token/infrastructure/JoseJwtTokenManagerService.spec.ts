import td from 'testdouble';
import { JoseJwtTokenManagerService } from 'shared/token/infrastructure/JoseJwtTokenManagerService';
import { Config } from 'shared/config/application/Config';

describe('JwtTokenService', () => {
  let config: Config;
  let jwtTokenService: JoseJwtTokenManagerService;

  beforeEach(() => {
    config = td.object();
    td.when(config.get('SECRET_HEX')).thenReturn(
      '3bdc741025576fa103f0fd755c88558a71586366e097943e1c1626c9ae8c04ed',
    );
    jwtTokenService = new JoseJwtTokenManagerService(config);
  });

  it('should be defined', () => {
    expect(jwtTokenService).toBeDefined();
  });
});
