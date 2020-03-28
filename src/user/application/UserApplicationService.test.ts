import { UserRepository } from 'user/domain/UserRepository';
import { UserDto } from 'user/application/dto/UserDto';
import { GetUsersQueryDto } from 'user/application/dto/GetUsersQueryDto';
import { UpdateUserDto } from 'user/application/dto/UpdateUserDto';
import { UserFakeRepository } from 'user/infrastructure/UserFakeRepository';
import { UserApplicationService } from 'user/application/UserApplicationService';
import { User } from 'user/domain/User';
import { Name } from 'user/domain/value-objects/Name';
import { Config } from 'shared/config/application/Config';
import { MockConfig } from 'shared/config/infrastructure/MockConfig';
import { TokenManager } from 'shared/token/application/TokenManager';
import { FakeTokenManagerService } from 'shared/token/infrastructure/FakeTokenManagerService';
import { FakeEventPublisherService } from 'shared/event/publisher/FakeEventPublisherService';
import { ModelFaker } from 'test/ModelFaker';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { UserDtoMap } from 'user/application/UserDtoMap';
import { MockObjectStorage } from 'shared/object-storage/infrastructure/MockObjectStorage';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { Avatar } from 'user/domain/value-objects/Avatar';
import ObjectID from 'bson-objectid';

describe('user service', () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let config: Config;
  let eventPublisher: FakeEventPublisherService;
  let userRepository: UserRepository;
  let userDtoMapper: UserDtoMap;
  let tokenService: TokenManager;
  let objectStorage: ObjectStorage;
  let userApplicationService: UserApplicationService;
  let user: User;

  beforeEach(async () => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();
    config = new MockConfig();
    eventPublisher = new FakeEventPublisherService();
    userRepository = new UserFakeRepository();
    userDtoMapper = new UserDtoMap(config);
    objectStorage = new MockObjectStorage();
    tokenService = new FakeTokenManagerService();
    userApplicationService = new UserApplicationService(
      userRepository,
      userDtoMapper,
      eventPublisher,
      tokenService,
      config,
      objectStorage,
    );

    user = modelFaker.user();
    await userRepository.persist(user);
  });

  it('should be defined', () => {
    expect(userApplicationService).toBeDefined();
  });

  describe('get users', () => {
    let query: GetUsersQueryDto;
    let users: User[];
    let expectedUserDtos: UserDto[];

    beforeEach(async () => {
      query = new GetUsersQueryDto();
      users = [modelFaker.user(), modelFaker.user(), modelFaker.user()];
      for (const user of users) {
        user.name = Name.from(user.name.first + 'ann', user.name.last);
      }
      await userRepository.persist(...users);
      expectedUserDtos = users.map((u) =>
        userDtoMapper.map(u, { authUser: user }),
      );
      jest.spyOn(userRepository, 'findPage');
      jest.spyOn(userRepository, 'findByName');
    });

    test('happy path', async () => {
      const actualUserDtos = await userApplicationService.getUsers(user, query);
      for (const expectedUserDto of expectedUserDtos) {
        expect(actualUserDtos).toContainEqual(expectedUserDto);
      }
      expect(userRepository.findPage).toHaveBeenCalled();
    });

    test('happy path, text search', async () => {
      query = new GetUsersQueryDto(undefined, 'ann');
      const actualUserDtos = await userApplicationService.getUsers(user, query);
      for (const expectedUserDto of expectedUserDtos) {
        expect(actualUserDtos).toContainEqual(expectedUserDto);
      }
      expect(userRepository.findByName).toHaveBeenCalled();
    });
  });

  describe('get user', () => {
    test('happy path', async () => {
      const expectedUserDto = userDtoMapper.map(user, { authUser: user });
      const actualUserDto = await userApplicationService.getUser(
        user,
        user.id.value,
      );
      expect(actualUserDto).toEqual(expectedUserDto);
    });

    test('should not expose email of another user', async () => {
      const anotherUser = modelFaker.user();
      await userRepository.persist(anotherUser);
      const expectedAnotherUserDto = userDtoMapper.map(anotherUser, {
        authUser: user,
      });
      const actualAnotherUserDto = await userApplicationService.getUser(
        user,
        anotherUser.id.value,
      );
      expect(actualAnotherUserDto).toEqual(expectedAnotherUserDto);
      expect(actualAnotherUserDto.email).toBeNull();
    });
  });

  describe('get auth user', () => {
    test('happy path', async () => {
      const expectedUserDto = userDtoMapper.map(user, { authUser: user });
      const actualUserDto = await userApplicationService.getAuthUser(user);
      expect(actualUserDto).toEqual(expectedUserDto);
    });
  });

  describe('update auth user', () => {
    let email: string;
    let firstName: string;
    let updateUserDto: UpdateUserDto;

    beforeEach(() => {
      email = primitiveFaker.email();
      firstName = primitiveFaker.word();
      updateUserDto = new UpdateUserDto(email, firstName);
    });

    test('happy path', async () => {
      await userApplicationService.updateAuthUser(user, updateUserDto);
      expect(user.email.value).not.toEqual(email);
      expect(user.name.first).toEqual(firstName);
    });
  });

  describe('update auth user avatar', () => {
    beforeEach(() => {
      jest.spyOn(objectStorage, 'put');
      jest.spyOn(objectStorage, 'delete');
    });

    test('happy path', async () => {
      await userApplicationService.updateAuthUserAvatar(user, '', 'image/jpeg');
      expect(user.avatar).toBeTruthy();
      expect(objectStorage.put).toHaveBeenCalled();
    });

    test('should delete old avatar', async () => {
      const oldAvatar = Avatar.from(new ObjectID().toHexString());
      user.avatar = oldAvatar;
      await userApplicationService.updateAuthUserAvatar(user, '', 'image/jpeg');
      expect(objectStorage.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          key: oldAvatar.value,
        }),
      );
      expect(objectStorage.put).toHaveBeenCalled();
      expect(user.avatar?.value).not.toEqual(oldAvatar.value);
    });

    test('should fail of content type not supported', async () => {
      await expect(
        userApplicationService.updateAuthUserAvatar(user, '', 'text/plain'),
      ).rejects.toThrow();
    });
  });

  describe('delete auth user avatar', () => {
    let avatarToDelete: Avatar;
    beforeEach(() => {
      avatarToDelete = Avatar.from(new ObjectID().toHexString());
      user.avatar = avatarToDelete;
      jest.spyOn(objectStorage, 'delete');
    });

    test('happy path', async () => {
      await userApplicationService.removeAuthUserAvatar(user);
      expect(user.avatar).toBeNull();
      expect(objectStorage.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          key: avatarToDelete.value,
        }),
      );
    });
  });

  describe('submit email change', () => {
    let newEmail: string;
    let emailChangeToken: string;

    beforeEach(() => {
      newEmail = primitiveFaker.word();
      emailChangeToken = tokenService.newEmailChangeToken(
        user.id.value,
        user.email.value,
        newEmail,
      );
    });

    test('happy path', async () => {
      await userApplicationService.submitEmailChange(emailChangeToken);
      expect(user.email.value).toEqual(newEmail);
    });
  });

  describe('delete authenticated user', () => {
    test('happy path', async () => {
      await userApplicationService.deleteAuthUser(user);
    });
  });
});
