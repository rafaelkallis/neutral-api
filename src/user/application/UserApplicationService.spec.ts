import td from 'testdouble';
import { UserRepository } from 'user/domain/UserRepository';
import { UpdateUserDto } from 'user/application/dto/UpdateUserDto';
import { UserApplicationService } from 'user/application/UserApplicationService';
import { User } from 'user/domain/User';
import { Config } from 'shared/config/application/Config';
import { MockConfig } from 'shared/config/infrastructure/MockConfig';
import { TokenManager } from 'shared/token/application/TokenManager';
import { ModelFaker } from 'test/ModelFaker';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { Avatar } from 'user/domain/value-objects/Avatar';
import ObjectID from 'bson-objectid';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Mock } from 'test/Mock';
import { MemoryUserRepository } from 'user/infrastructure/MemoryUserRepository';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';

describe(UserApplicationService.name, () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let config: Config;
  let domainEventBroker: DomainEventBroker;
  let userRepository: UserRepository;
  let mockModelMapper: ObjectMapper;
  let tokenManager: TokenManager;
  let objectStorage: ObjectStorage;
  let userApplicationService: UserApplicationService;
  let user: User;
  let mockUserDto: object;

  beforeEach(async () => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();
    config = new MockConfig();
    domainEventBroker = td.object();
    userRepository = new MemoryUserRepository();
    mockModelMapper = Mock(ObjectMapper);
    objectStorage = td.object();
    tokenManager = td.object();
    userApplicationService = new UserApplicationService(
      userRepository,
      mockModelMapper,
      domainEventBroker,
      tokenManager,
      config,
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

  describe('update auth user', () => {
    let email: string;
    let firstName: string;
    let updateUserDto: UpdateUserDto;
    let emailChangeToken: string;

    beforeEach(() => {
      email = primitiveFaker.email();
      firstName = primitiveFaker.word();
      updateUserDto = new UpdateUserDto(email, firstName);
      emailChangeToken = primitiveFaker.id();
      td.when(
        tokenManager.newEmailChangeToken(
          user.id.value,
          user.email.value,
          email,
        ),
      ).thenReturn(emailChangeToken);
    });

    test('happy path', async () => {
      await userApplicationService.updateAuthUser(user, updateUserDto);
      expect(user.email.value).not.toEqual(email);
      expect(user.name.first).toEqual(firstName);
      // TODO: td.verify(eventPublisher.publish(td.matchers.containing({ emailChangeMagicLink: td.matchers.containing(emailChangeToken) })))
    });
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

  describe('submit email change', () => {
    let newEmail: string;
    let emailChangeToken: string;

    beforeEach(() => {
      newEmail = primitiveFaker.email();
      emailChangeToken = primitiveFaker.id();
      td.when(
        tokenManager.validateEmailChangeToken(emailChangeToken),
      ).thenReturn({
        sub: user.id.value,
        curEmail: user.email.value,
        newEmail,
      });
    });

    test('happy path', async () => {
      await userApplicationService.submitEmailChange(emailChangeToken);
      expect(user.email.value).toEqual(newEmail);
    });
  });

  describe('delete authenticated user', () => {
    test('happy path', async () => {
      await userApplicationService.forgetAuthUser(user);
    });
  });
});
