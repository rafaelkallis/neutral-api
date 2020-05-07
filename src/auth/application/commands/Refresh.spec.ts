import td from 'testdouble';
import { TokenManager } from 'shared/token/application/TokenManager';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import {
  RefreshCommand,
  RefreshCommandHandler,
} from 'auth/application/commands/Refresh';
import { RefreshResponseDto } from '../dto/RefreshResponseDto';

describe(RefreshCommand.name, () => {
  let tokenManager: TokenManager;
  let refreshCommandHandler: RefreshCommandHandler;
  let userId: string;
  let refreshToken: string;
  let accessToken: string;
  let refreshCommand: RefreshCommand;

  beforeEach(() => {
    tokenManager = td.object<TokenManager>();
    refreshCommandHandler = new RefreshCommandHandler(tokenManager);
    const primitiveFaker = new PrimitiveFaker();
    refreshToken = primitiveFaker.id();
    refreshCommand = new RefreshCommand(refreshToken);
    userId = primitiveFaker.id();
    td.when(tokenManager.validateRefreshToken(refreshToken)).thenReturn({
      sub: userId,
    });
    accessToken = primitiveFaker.id();
    td.when(tokenManager.newAccessToken(userId)).thenReturn(accessToken);
  });

  test('should be defined', () => {
    expect(refreshCommandHandler).toBeDefined();
  });

  test('happy path', () => {
    const result = refreshCommandHandler.handle(refreshCommand);
    expect(result).toBeInstanceOf(RefreshResponseDto);
    expect(result.accessToken).toBe(accessToken);
  });
});
