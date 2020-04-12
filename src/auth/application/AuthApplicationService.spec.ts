import { AuthService } from 'auth/application/AuthApplicationService';
import { RefreshDto } from 'auth/application/dto/RefreshDto';
import { SessionState } from 'shared/session/session-state';
import { MockSessionState } from 'shared/session';
import { FakeTokenManagerService } from 'shared/token/infrastructure/FakeTokenManagerService';
import { User } from 'user/domain/User';
import { ModelFaker } from 'test/ModelFaker';

describe('auth application service', () => {
  let modelFaker: ModelFaker;
  let authService: AuthService;
  let tokenService: FakeTokenManagerService;

  beforeEach(() => {
    modelFaker = new ModelFaker();
    tokenService = new FakeTokenManagerService();

    authService = new AuthService(tokenService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('refresh', () => {
    let user: User;
    let refreshToken: string;

    beforeEach(() => {
      user = modelFaker.user();
      refreshToken = tokenService.newRefreshToken(user.id.value);
    });

    test('happy path', async () => {
      const dto = new RefreshDto(refreshToken);
      expect(authService.refresh(dto)).toEqual({
        accessToken: expect.any(String),
      });
    });
  });

  describe('logout', () => {
    let session: SessionState;

    beforeEach(() => {
      session = new MockSessionState();
      jest.spyOn(session, 'clear');
    });

    test('happy path', async () => {
      await authService.logout(session);
      expect(session.clear).toHaveBeenCalled();
    });
  });
});
