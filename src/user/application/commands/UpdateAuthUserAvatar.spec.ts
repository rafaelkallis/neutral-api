import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserDto } from 'user/application/dto/UserDto';
import { UnitTestScenario } from 'test/UnitTestScenario';
import {
  UpdateAuthUserAvatarCommand,
  UpdateAuthUserAvatarCommandHandler,
} from './UpdateAuthUserAvatar';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { Avatar } from 'user/domain/value-objects/Avatar';

describe(UpdateAuthUserAvatarCommand.name, () => {
  let scenario: UnitTestScenario<UpdateAuthUserAvatarCommandHandler>;
  let commandHandler: UpdateAuthUserAvatarCommandHandler;
  let authUser: User;
  let newAvatar: Avatar;
  let contentType: string;
  let command: UpdateAuthUserAvatarCommand;
  let userDto: UserDto;
  let objectStorage: ObjectStorage;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(
      UpdateAuthUserAvatarCommandHandler,
    )
      .addProviderMock(ObjectMapper)
      .addProviderMock(UserRepository)
      .addProviderMock(ObjectStorage)
      .build();
    commandHandler = scenario.subject;
    authUser = scenario.modelFaker.user();
    newAvatar = Avatar.create();
    contentType = 'image/png';

    const objectMapper = scenario.module.get(ObjectMapper);
    userDto = td.object();
    td.when(
      objectMapper.map(authUser, UserDto, td.matchers.anything()),
    ).thenReturn(userDto);

    objectStorage = scenario.module.get(ObjectStorage);
    td.when(objectStorage.put(td.matchers.anything())).thenResolve({
      key: newAvatar.value,
    });

    command = new UpdateAuthUserAvatarCommand(
      authUser,
      'avatar file',
      contentType,
    );
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBe(userDto);
    expect(authUser.avatar?.equals(newAvatar)).toBeTruthy();
  });

  test('should delete old avatar', async () => {
    const oldAvatar = Avatar.create();
    authUser.avatar = oldAvatar;
    await commandHandler.handle(command);
    td.verify(
      objectStorage.delete(
        td.matchers.contains({
          key: oldAvatar.value,
        }),
      ),
    );
    expect(authUser.avatar?.equals(newAvatar)).toBeTruthy();
  });

  test('should fail of content type not supported', async () => {
    command = new UpdateAuthUserAvatarCommand(
      authUser,
      'avatar file',
      'text/plain',
    );
    await expect(commandHandler.handle(command)).rejects.toThrow();
  });
});
