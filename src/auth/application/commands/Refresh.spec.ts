import td from 'testdouble';
import { TokenManager } from 'shared/token/application/TokenManager';
import {
  RefreshCommand,
  RefreshCommandHandler,
} from 'auth/application/commands/Refresh';
import { RefreshResponseDto } from '../dto/RefreshResponseDto';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { MediatorRegistry } from 'shared/mediator/MediatorRegistry';

describe(RefreshCommand.name, () => {
  let scenario: UnitTestScenario<RefreshCommandHandler>;
  let refreshCommand: RefreshCommand;
  let refreshCommandHandler: RefreshCommandHandler;
  let userId: string;
  let refreshToken: string;
  let accessToken: string;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(RefreshCommandHandler)
      .addProviderMock(MediatorRegistry)
      .addProviderMock(TokenManager)
      .build();
    refreshCommandHandler = scenario.subject;
    const tokenManager = scenario.module.get(TokenManager);
    refreshToken = scenario.primitiveFaker.id();
    refreshCommand = new RefreshCommand(refreshToken);
    userId = scenario.primitiveFaker.id();
    td.when(tokenManager.validateRefreshToken(refreshToken)).thenReturn({
      sub: userId,
    });
    accessToken = scenario.primitiveFaker.id();
    td.when(tokenManager.newAccessToken(userId)).thenReturn(accessToken);
  });

  test('happy path', () => {
    const result = refreshCommandHandler.handle(refreshCommand);
    expect(result).toBeInstanceOf(RefreshResponseDto);
    expect(result.accessToken).toBe(accessToken);
  });
});
