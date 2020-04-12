import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { SessionState } from 'shared/session/session-state';
import { EventPublisher } from 'shared/event/publisher/EventPublisher';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { UserDto } from 'user/application/dto/UserDto';
import { AuthenticationResponseDto } from '../dto/AuthenticationResponseDto';
import {
  SubmitSignupCommandHandler,
  SubmitSignupCommand,
} from './SubmitSignup';
import { Email } from 'user/domain/value-objects/Email';
import { SignupEvent } from '../events/SignupEvent';
import { Name } from 'user/domain/value-objects/Name';
import { EmailAlreadyUsedException } from '../exceptions/EmailAlreadyUsedException';

describe(SubmitSignupCommand.name, () => {
  let userRepository: UserRepository;
  let tokenManager: TokenManager;
  let objectMapper: ObjectMapper;
  let eventPublisher: EventPublisher;
  let commandHandler: SubmitSignupCommandHandler;
  let email: string;
  let firstName: string;
  let lastName: string;
  let signupToken: string;
  let sessionToken: string;
  let accessToken: string;
  let refreshToken: string;
  let session: SessionState;
  let userDto: UserDto;
  let command: SubmitSignupCommand;

  beforeEach(async () => {
    userRepository = td.object();
    tokenManager = td.object();
    objectMapper = td.object();
    eventPublisher = td.object();
    commandHandler = new SubmitSignupCommandHandler(
      userRepository,
      tokenManager,
      objectMapper,
      eventPublisher,
    );
    const primitiveFaker = new PrimitiveFaker();
    signupToken = primitiveFaker.id();
    session = td.object();
    email = primitiveFaker.email();
    firstName = primitiveFaker.word();
    lastName = primitiveFaker.word();
    command = new SubmitSignupCommand(
      signupToken,
      session,
      firstName,
      lastName,
    );
    td.when(userRepository.existsByEmail(Email.from(email))).thenResolve(false);
    td.when(tokenManager.validateSignupToken(signupToken)).thenReturn({
      sub: email,
    });
    sessionToken = primitiveFaker.id();
    td.when(tokenManager.newSessionToken(td.matchers.isA(String))).thenReturn(
      sessionToken,
    );
    accessToken = primitiveFaker.id();
    td.when(tokenManager.newAccessToken(td.matchers.isA(String))).thenReturn(
      accessToken,
    );
    refreshToken = primitiveFaker.id();
    td.when(tokenManager.newRefreshToken(td.matchers.isA(String))).thenReturn(
      refreshToken,
    );
    userDto = td.object<UserDto>();
    td.when(
      objectMapper.map(td.matchers.isA(User), UserDto, td.matchers.anything()),
    ).thenReturn(userDto);
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBeInstanceOf(AuthenticationResponseDto);
    expect(result.accessToken).toBe(accessToken);
    expect(result.refreshToken).toBe(refreshToken);
    expect(result.user).toBe(userDto);
    td.verify(userRepository.persist(td.matchers.isA(User)));
    td.verify(
      userRepository.persist(
        td.matchers.contains({
          email: Email.from(email),
          name: Name.from(firstName, lastName),
        }),
      ),
    );
    td.verify(session.set(sessionToken));
    td.verify(eventPublisher.publish(td.matchers.isA(SignupEvent)), {
      ignoreExtraArgs: true,
    });
  });

  test('when email already used should throw exception', async () => {
    td.when(userRepository.existsByEmail(Email.from(email))).thenResolve(true);
    await expect(commandHandler.handle(command)).rejects.toThrowError(
      EmailAlreadyUsedException,
    );
  });
});
