import { AuthService } from 'auth/application/AuthApplicationService';
import { SessionState } from 'shared/session/session-state';
import { MockSessionState } from 'shared/session';

describe('auth application service', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
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
