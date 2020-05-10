import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserDto } from 'user/application/dto/UserDto';
import { UnitTestScenario } from 'test/UnitTestScenario';
import {
  UpdateAuthUserAvatarCommand,
  UpdateAuthUserAvatarCommandHandler,
} from 'user/application/commands/UpdateAuthUserAvatar';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { AvatarStore } from 'user/application/AvatarStore';

describe(UpdateAuthUserAvatarCommand.name, () => {
  let scenario: UnitTestScenario<UpdateAuthUserAvatarCommandHandler>;
  let commandHandler: UpdateAuthUserAvatarCommandHandler;
  let oldAvatar: Avatar;
  let authUser: User;
  let contentType: string;
  let command: UpdateAuthUserAvatarCommand;
  let userDto: UserDto;
  let avatarStore: AvatarStore;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(
      UpdateAuthUserAvatarCommandHandler,
    )
      .addProviderMock(ObjectMapper)
      .addProviderMock(UserRepository)
      .addProviderMock(AvatarStore)
      .build();
    commandHandler = scenario.subject;
    oldAvatar = Avatar.create();
    authUser = scenario.modelFaker.user();
    authUser.avatar = oldAvatar;
    contentType = 'image/png';

    const objectMapper = scenario.module.get(ObjectMapper);
    userDto = td.object();
    td.when(
      objectMapper.map(authUser, UserDto, td.matchers.anything()),
    ).thenReturn(userDto);

    avatarStore = scenario.module.get(AvatarStore);

    command = new UpdateAuthUserAvatarCommand(
      authUser,
      'avatar file',
      contentType,
    );
  });

  test('should replace auth user avatar', async () => {
    await commandHandler.handle(command);
    expect(authUser.avatar).toBeDefined();
    expect(authUser.avatar?.equals(oldAvatar)).toBeFalsy();
  });

  test('should return dto', async () => {
    const actualUserDto = await commandHandler.handle(command);
    expect(actualUserDto).toBe(userDto);
  });

  test('should delete old avatar', async () => {
    await commandHandler.handle(command);
    td.verify(avatarStore.delete(oldAvatar));
  });
});
