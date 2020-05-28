import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import { User } from 'user/domain/User';
import { ModelFaker } from 'test/ModelFaker';
import { SubmitLoginCommand, SubmitLoginCommandHandler } from './SubmitLogin';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { SessionState } from 'shared/session/session-state';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { UserDto } from 'user/application/dto/UserDto';
import { AuthenticationResponseDto } from '../dto/AuthenticationResponseDto';

describe(SubmitLoginCommand.name, () => {
  let userRepository: UserRepository;
  let tokenManager: TokenManager;
  let objectMapper: ObjectMapper;
  let commandHandler: SubmitLoginCommandHandler;
  let user: User;
  let loginToken: string;
  let sessionToken: string;
  let accessToken: string;
  let refreshToken: string;
  let session: SessionState;
  let userDto: UserDto;
  let command: SubmitLoginCommand;

  beforeEach(() => {
    userRepository = td.object();
    tokenManager = td.object();
    objectMapper = td.object();
    commandHandler = new SubmitLoginCommandHandler(
      td.object(),
      userRepository,
      tokenManager,
      objectMapper,
    );
    const modelFaker = new ModelFaker();
    user = modelFaker.user();
    const primitiveFaker = new PrimitiveFaker();
    loginToken = primitiveFaker.id();
    session = td.object();
    command = new SubmitLoginCommand(loginToken, session);
    td.when(tokenManager.validateLoginToken(loginToken)).thenReturn({
      sub: user.id.value,
      lastLoginAt: user.lastLoginAt.value,
    });
    td.when(userRepository.findById(user.id)).thenResolve(user);
    sessionToken = primitiveFaker.id();
    td.when(tokenManager.newSessionToken(user.id.value)).thenReturn(
      sessionToken,
    );
    accessToken = primitiveFaker.id();
    td.when(tokenManager.newAccessToken(user.id.value)).thenReturn(accessToken);
    refreshToken = primitiveFaker.id();
    td.when(tokenManager.newRefreshToken(user.id.value)).thenReturn(
      refreshToken,
    );
    userDto = td.object<UserDto>();
    td.when(objectMapper.map(user, UserDto, { authUser: user })).thenReturn(
      userDto,
    );
  });

  test('happy path', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBeInstanceOf(AuthenticationResponseDto);
    expect(result.accessToken).toBe(accessToken);
    expect(result.refreshToken).toBe(refreshToken);
    expect(result.user).toBe(userDto);
    td.verify(userRepository.persist(user));
    td.verify(session.set(sessionToken));
  });
});
