import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import { UserApplicationService } from 'user/application/UserApplicationService';
import { User } from 'user/domain/User';
import { ModelFaker } from 'test/ModelFaker';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { Avatar } from 'user/domain/value-objects/Avatar';
import ObjectID from 'bson-objectid';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Mock } from 'test/Mock';
import { MemoryUserRepository } from 'user/infrastructure/MemoryUserRepository';

describe(UserApplicationService.name, () => {
  let modelFaker: ModelFaker;
  let userRepository: UserRepository;
  let mockModelMapper: ObjectMapper;
  let objectStorage: ObjectStorage;
  let userApplicationService: UserApplicationService;
  let user: User;
  let mockUserDto: object;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    userRepository = new MemoryUserRepository();
    mockModelMapper = Mock(ObjectMapper);
    objectStorage = td.object();
    userApplicationService = new UserApplicationService(
      userRepository,
      mockModelMapper,
      objectStorage,
    );

    user = modelFaker.user();
    await userRepository.persist(user);
    mockUserDto = {};
    jest.spyOn(mockModelMapper, 'map').mockReturnValue(mockUserDto);
  });

  it('should be defined', () => {
    expect(userApplicationService).toBeDefined();
  });

  describe('update auth user avatar', () => {
    let newAvatar: Avatar;

    beforeEach(() => {
      newAvatar = Avatar.create();
      td.when(objectStorage.put(td.matchers.anything())).thenResolve({
        key: newAvatar.value,
      });
    });

    test('happy path', async () => {
      await userApplicationService.updateAuthUserAvatar(
        user,
        'file',
        'image/jpeg',
      );
      expect(user.avatar?.equals(newAvatar)).toBeTruthy();
    });

    test('should delete old avatar', async () => {
      const oldAvatar = Avatar.create();
      user.avatar = oldAvatar;
      await userApplicationService.updateAuthUserAvatar(
        user,
        'file',
        'image/jpeg',
      );
      td.verify(
        objectStorage.delete(
          td.matchers.contains({
            key: oldAvatar.value,
          }),
        ),
      );
      expect(user.avatar?.equals(newAvatar)).toBeTruthy();
    });

    test('should fail of content type not supported', async () => {
      await expect(
        userApplicationService.updateAuthUserAvatar(user, 'file', 'text/plain'),
      ).rejects.toThrow();
    });
  });

  describe('delete auth user avatar', () => {
    let avatarToDelete: Avatar;
    beforeEach(() => {
      avatarToDelete = Avatar.from(new ObjectID().toHexString());
      user.avatar = avatarToDelete;
    });

    test('happy path', async () => {
      await userApplicationService.removeAuthUserAvatar(user);
      expect(user.avatar).toBeNull();
      td.verify(
        objectStorage.delete(
          td.matchers.contains({
            key: avatarToDelete.value,
          }),
        ),
      );
    });
  });
});
