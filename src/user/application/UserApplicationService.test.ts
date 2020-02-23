import { ModelFaker, PrimitiveFaker } from 'test';
import { UserRepository } from 'user/domain/UserRepository';
import { UserDto } from 'user/application/dto/UserDto';
import { GetUsersQueryDto } from 'user/application/dto/GetUsersQueryDto';
import { UpdateUserDto } from 'user/application/dto/UpdateUserDto';
import { UserFakeRepository } from 'user/infrastructure/UserFakeRepository';
import { MockConfigService, ConfigService } from 'config';
import { MockTokenService, TokenService } from 'token';
import { UserApplicationService } from 'user/application/UserApplicationService';
import { MockEventPublisherService } from 'event';
import { User } from 'user/domain/User';
import { Name } from 'user/domain/value-objects/Name';

describe('user service', () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let config: ConfigService;
  let eventPublisher: MockEventPublisherService;
  let userRepository: UserRepository;
  let tokenService: TokenService;
  let userApplicationService: UserApplicationService;
  let user: User;

  beforeEach(async () => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();
    config = new MockConfigService();
    eventPublisher = new MockEventPublisherService();
    userRepository = new UserFakeRepository();
    tokenService = new MockTokenService();
    userApplicationService = new UserApplicationService(
      userRepository,
      eventPublisher,
      tokenService,
      config,
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
      expectedUserDtos = users.map(u =>
        UserDto.builder()
          .user(u)
          .authUser(user)
          .build(),
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
      const expectedUserDto = UserDto.builder()
        .user(user)
        .authUser(user)
        .build();
      const actualUserDto = await userApplicationService.getUser(
        user,
        user.id.value,
      );
      expect(actualUserDto).toEqual(expectedUserDto);
    });

    test('should not expose email of another user', async () => {
      const anotherUser = modelFaker.user();
      await userRepository.persist(anotherUser);
      const expectedAnotherUserDto = UserDto.builder()
        .user(anotherUser)
        .authUser(user)
        .build();
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
      const expectedUserDto = UserDto.builder()
        .user(user)
        .authUser(user)
        .build();
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
