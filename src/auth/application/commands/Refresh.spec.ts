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
  let commandHandler: RefreshCommandHandler;
  let userId: string;
  let refreshToken: string;
  let accessToken: string;
  let command: RefreshCommand;

  beforeEach(async () => {
    tokenManager = td.object<TokenManager>();
    commandHandler = new RefreshCommandHandler(tokenManager);
    const primitiveFaker = new PrimitiveFaker();
    refreshToken = primitiveFaker.id();
    command = new RefreshCommand(refreshToken);
    userId = primitiveFaker.id();
    td.when(tokenManager.validateRefreshToken(refreshToken)).thenReturn({
      sub: userId,
    });
    accessToken = primitiveFaker.id();
    td.when(tokenManager.newAccessToken(userId)).thenReturn(accessToken);
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBeInstanceOf(RefreshResponseDto);
    expect(result.accessToken).toBe(accessToken);
  });
});
