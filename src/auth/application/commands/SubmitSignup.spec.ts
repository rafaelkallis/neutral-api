import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import { ReadonlyUser } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { SessionState } from 'shared/session/session-state';
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
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { UserFactory } from 'user/application/UserFactory';
import { UnitTestScenario } from 'test/UnitTestScenario';

describe(SubmitSignupCommand.name, () => {
  let scenario: UnitTestScenario<SubmitSignupCommandHandler>;
  let commandHandler: SubmitSignupCommandHandler;
  let userRepository: UserRepository;
  let userFactory: UserFactory;
  let tokenManager: TokenManager;
  let objectMapper: ObjectMapper;
  let domainEventBroker: DomainEventBroker;
  let email: string;
  let firstName: string;
  let lastName: string;
  let createdUser: ReadonlyUser;
  let signupToken: string;
  let sessionToken: string;
  let accessToken: string;
  let refreshToken: string;
  let session: SessionState;
  let userDto: UserDto;
  let command: SubmitSignupCommand;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(SubmitSignupCommandHandler)
      .addProviderMock(UserRepository)
      .addProviderMock(UserFactory)
      .addProviderMock(TokenManager)
      .addProviderMock(ObjectMapper)
      .addProviderMock(DomainEventBroker)
      .build();
    commandHandler = scenario.subject;
    userRepository = scenario.module.get(UserRepository);
    userFactory = scenario.module.get(UserFactory);
    tokenManager = scenario.module.get(TokenManager);
    objectMapper = scenario.module.get(ObjectMapper);
    domainEventBroker = scenario.module.get(DomainEventBroker);

    signupToken = scenario.primitiveFaker.id();
    session = td.object();
    email = scenario.primitiveFaker.email();
    firstName = scenario.primitiveFaker.word();
    lastName = scenario.primitiveFaker.word();
    command = new SubmitSignupCommand(
      signupToken,
      session,
      firstName,
      lastName,
    );
    td.when(userRepository.existsByEmail(Email.from(email))).thenResolve(false);

    createdUser = td.object(scenario.modelFaker.user());
    td.when(userFactory.create({ email: Email.from(email) })).thenReturn(
      createdUser,
    );

    td.when(tokenManager.validateSignupToken(signupToken)).thenReturn({
      sub: email,
    });
    sessionToken = scenario.primitiveFaker.id();
    td.when(tokenManager.newSessionToken(createdUser.id.value)).thenReturn(
      sessionToken,
    );
    accessToken = scenario.primitiveFaker.id();
    td.when(tokenManager.newAccessToken(createdUser.id.value)).thenReturn(
      accessToken,
    );
    refreshToken = scenario.primitiveFaker.id();
    td.when(tokenManager.newRefreshToken(createdUser.id.value)).thenReturn(
      refreshToken,
    );
    userDto = td.object();
    td.when(
      objectMapper.map(createdUser, UserDto, td.matchers.anything()),
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
    td.verify(createdUser.activate(Name.from(firstName, lastName)));
    td.verify(userRepository.persist(createdUser));
    td.verify(session.set(sessionToken));
    td.verify(domainEventBroker.publish(td.matchers.isA(SignupEvent)), {
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
