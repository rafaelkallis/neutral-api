import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserDto } from 'user/application/dto/UserDto';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { Avatar } from 'user/domain/value-objects/Avatar';
import {
  RemoveAuthUserAvatarCommand,
  RemoveAuthUserAvatarCommandHandler,
} from './RemoveAuthUserAvatar';

describe(RemoveAuthUserAvatarCommand.name, () => {
  let scenario: UnitTestScenario<RemoveAuthUserAvatarCommandHandler>;
  let commandHandler: RemoveAuthUserAvatarCommandHandler;
  let authUser: User;
  let avatarToDelete: Avatar;
  let command: RemoveAuthUserAvatarCommand;
  let userDto: UserDto;
  let objectStorage: ObjectStorage;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(
      RemoveAuthUserAvatarCommandHandler,
    )
      .addProviderMock(ObjectMapper)
      .addProviderMock(UserRepository)
      .addProviderMock(ObjectStorage)
      .build();
    commandHandler = scenario.subject;
    authUser = scenario.modelFaker.user();
    avatarToDelete = Avatar.create();
    authUser.updateAvatar(avatarToDelete);

    const objectMapper = scenario.module.get(ObjectMapper);
    userDto = td.object();
    td.when(
      objectMapper.map(authUser, UserDto, td.matchers.anything()),
    ).thenResolve(userDto);

    objectStorage = scenario.module.get(ObjectStorage);

    command = new RemoveAuthUserAvatarCommand(authUser);
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBe(userDto);
    expect(authUser.avatar).toBeNull();
    td.verify(
      objectStorage.delete(
        td.matchers.contains({
          key: avatarToDelete.value,
        }),
      ),
    );
  });
});
