import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserDto } from 'user/application/dto/UserDto';
import { UnitTestScenario } from 'test/UnitTestScenario';
import {
  SubmitEmailChangeCommand,
  SubmitEmailChangeCommandHandler,
} from './SubmitEmailChange';

describe(SubmitEmailChangeCommand.name, () => {
  let scenario: UnitTestScenario<SubmitEmailChangeCommandHandler>;
  let commandHandler: SubmitEmailChangeCommandHandler;
  let authUser: User;
  let emailChangeToken: string;
  let newEmail: string;
  let command: SubmitEmailChangeCommand;
  let userDto: UserDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(SubmitEmailChangeCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(UserRepository)
      .addProviderMock(TokenManager)
      .build();
    commandHandler = scenario.subject;
    authUser = scenario.modelFaker.user();
    emailChangeToken = td.object();
    command = new SubmitEmailChangeCommand(authUser, emailChangeToken);

    const objectMapper = scenario.module.get(ObjectMapper);
    userDto = td.object();
    td.when(
      objectMapper.map(authUser, UserDto, td.matchers.anything()),
    ).thenResolve(userDto);

    newEmail = scenario.primitiveFaker.email();
    const tokenManager = scenario.module.get(TokenManager);
    td.when(tokenManager.validateEmailChangeToken(emailChangeToken)).thenReturn(
      {
        curEmail: authUser.email.value,
        sub: authUser.id.value,
        newEmail,
      },
    );
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBe(userDto);
    expect(authUser.email.value).toEqual(newEmail);
  });
});
