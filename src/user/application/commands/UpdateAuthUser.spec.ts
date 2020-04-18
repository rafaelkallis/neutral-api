import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserDto } from 'user/application/dto/UserDto';
import { Email } from 'user/domain/value-objects/Email';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import {
  UpdateAuthUserCommand,
  UpdateAuthUserCommandHandler,
} from 'user/application/commands/UpdateAuthUser';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { Config } from 'shared/config/application/Config';
// TODO should be in user module
import { EmailAlreadyUsedException } from 'auth/application/exceptions/EmailAlreadyUsedException';

describe(UpdateAuthUserCommand.name, () => {
  let scenario: UnitTestScenario<UpdateAuthUserCommandHandler>;
  let commandHandler: UpdateAuthUserCommandHandler;
  let userRepository: UserRepository;
  let authUser: User;
  let newEmail: string;
  let newFirstName: string;
  let emailChangeToken: string;
  let command: UpdateAuthUserCommand;
  let userDto: UserDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(UpdateAuthUserCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(UserRepository)
      .addProviderMock(TokenManager)
      .addProviderMock(Config)
      .addProviderMock(DomainEventBroker)
      .build();
    commandHandler = scenario.subject;
    userRepository = scenario.module.get(UserRepository);
    authUser = scenario.modelFaker.user();

    const objectMapper = scenario.module.get(ObjectMapper);
    userDto = td.object();
    td.when(
      objectMapper.map(authUser, UserDto, td.matchers.anything()),
    ).thenReturn(userDto);

    const tokenManager = scenario.module.get(TokenManager);
    emailChangeToken = td.object();
    td.when(
      tokenManager.newEmailChangeToken(
        authUser.id.value,
        authUser.email.value,
        newEmail,
      ),
    ).thenReturn(emailChangeToken);

    newEmail = scenario.primitiveFaker.email();
    newFirstName = scenario.primitiveFaker.word();
    command = new UpdateAuthUserCommand(authUser, newEmail, newFirstName);
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBe(userDto);
    expect(authUser.email.value).not.toEqual(newEmail);
    expect(authUser.name.first).toEqual(newFirstName);
    td.verify(userRepository.persist(td.matchers.isA(User)));
  });

  test('when email already used should throw exception', async () => {
    td.when(userRepository.existsByEmail(Email.from(newEmail))).thenResolve(
      true,
    );
    await expect(commandHandler.handle(command)).rejects.toThrowError(
      EmailAlreadyUsedException,
    );
  });
});
