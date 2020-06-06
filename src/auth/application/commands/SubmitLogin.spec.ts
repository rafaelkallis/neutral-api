import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import {
  TokenManager,
  LoginToken,
} from 'shared/token/application/TokenManager';
import { InternalUser } from 'user/domain/User';
import { SubmitLoginCommand, SubmitLoginCommandHandler } from './SubmitLogin';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { SessionState } from 'shared/session/session-state';
import { UserDto } from 'user/application/dto/UserDto';
import { AuthenticationResponseDto } from '../dto/AuthenticationResponseDto';
import { PendingState } from 'user/domain/value-objects/states/PendingState';
import { UserFactory } from 'user/application/UserFactory';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ActiveState } from 'user/domain/value-objects/states/ActiveState';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';

describe(SubmitLoginCommand.name, () => {
  let scenario: UnitTestScenario<SubmitLoginCommandHandler>;
  let submitLoginCommandHandler: SubmitLoginCommandHandler;
  let userRepository: UserRepository;
  let userFactory: UserFactory;
  let tokenManager: TokenManager;
  let objectMapper: ObjectMapper;
  let user: InternalUser;
  let loginToken: string;
  let sessionToken: string;
  let accessToken: string;
  let refreshToken: string;
  let session: SessionState;
  let userDto: UserDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(SubmitLoginCommandHandler)
      .addProviderMock(UserRepository)
      .addProviderMock(UserFactory)
      .addProviderMock(TokenManager)
      .addProviderMock(ObjectMapper)
      .build();
    submitLoginCommandHandler = scenario.subject;
    userRepository = scenario.module.get(UserRepository);
    userFactory = scenario.module.get(UserFactory);
    tokenManager = scenario.module.get(TokenManager);
    objectMapper = scenario.module.get(ObjectMapper);
    user = scenario.modelFaker.user();
    jest.spyOn(user, 'login');
    loginToken = scenario.primitiveFaker.id();
    session = td.object();
    td.when(tokenManager.validateLoginToken(loginToken)).thenReturn<LoginToken>(
      {
        sub: user.email.value,
        lastLoginAt: user.lastLoginAt.value,
      },
    );
    td.when(userRepository.findByEmail(user.email)).thenResolve(user);
    sessionToken = scenario.primitiveFaker.id();
    td.when(tokenManager.newSessionToken(user.id.value)).thenReturn(
      sessionToken,
    );
    accessToken = scenario.primitiveFaker.id();
    td.when(tokenManager.newAccessToken(user.id.value)).thenReturn(accessToken);
    refreshToken = scenario.primitiveFaker.id();
    td.when(tokenManager.newRefreshToken(user.id.value)).thenReturn(
      refreshToken,
    );
    userDto = td.object<UserDto>();
    td.when(objectMapper.map(user, UserDto)).thenReturn(userDto);
  });

  async function act(): Promise<AuthenticationResponseDto> {
    const submitLoginCommand = new SubmitLoginCommand(loginToken, session);
    return submitLoginCommandHandler.handle(submitLoginCommand);
  }

  test('result should be authentication response dto', async () => {
    const result = await act();
    expect(result).toBeInstanceOf(AuthenticationResponseDto);
    expect(result.accessToken).toBe(accessToken);
    expect(result.refreshToken).toBe(refreshToken);
    expect(result.user).toBe(userDto);
  });

  test('user should be logged in', async () => {
    await act();
    expect(user.login).toHaveBeenCalledWith();
  });

  test('user should be persisted', async () => {
    await act();
    td.verify(userRepository.persist(user));
    td.verify(session.set(sessionToken));
  });

  test('session should be set', async () => {
    await act();
    td.verify(session.set(sessionToken));
  });

  describe('when user is pending', () => {
    beforeEach(() => {
      user.state = PendingState.getInstance();
    });

    test('should activate user', async () => {
      await act();
      expect(user.login).toHaveBeenCalledWith();
      expect(user.state).toBe(ActiveState.getInstance());
    });
  });

  describe('when user is new', () => {
    beforeEach(() => {
      td.when(tokenManager.validateLoginToken(loginToken)).thenReturn<
        LoginToken
      >({
        sub: user.email.value,
        lastLoginAt: LastLoginAt.never().value,
      });
      td.when(userRepository.findByEmail(user.email)).thenResolve(undefined);
      user.state = PendingState.getInstance();
      td.when(userFactory.create({ email: user.email })).thenReturn(user);
    });

    test('should create and activate user', async () => {
      await act();
      expect(user.login).toHaveBeenCalledWith();
      expect(user.state).toBe(ActiveState.getInstance());
    });
  });
});
