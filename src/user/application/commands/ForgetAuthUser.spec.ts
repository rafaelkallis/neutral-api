import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserDto } from 'user/application/dto/UserDto';
import { UnitTestScenario } from 'test/UnitTestScenario';
import {
  ForgetAuthUserCommand,
  ForgetAuthUserCommandHandler,
} from 'user/application/commands/ForgetAuthUser';

describe(ForgetAuthUserCommand.name, () => {
  let scenario: UnitTestScenario<ForgetAuthUserCommandHandler>;
  let commandHandler: ForgetAuthUserCommandHandler;
  let authUser: User;
  let command: ForgetAuthUserCommand;
  let userDto: UserDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(ForgetAuthUserCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(UserRepository)
      .build();
    commandHandler = scenario.subject;
    authUser = td.object(scenario.modelFaker.user());

    const objectMapper = scenario.module.get(ObjectMapper);
    userDto = td.object();
    td.when(
      objectMapper.map(authUser, UserDto, td.matchers.anything()),
    ).thenResolve(userDto);

    command = new ForgetAuthUserCommand(authUser);
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBe(userDto);
    td.verify(authUser.forget());
  });
});
