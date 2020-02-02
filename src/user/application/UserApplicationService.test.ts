import { ModelFaker, PrimitiveFaker } from 'test';
import { UserRepository } from 'user/domain/UserRepository';
import { UserDto } from 'user/application/dto/UserDto';
import { GetUsersQueryDto } from 'user/application/dto/GetUsersQueryDto';
import { UpdateUserDto } from 'user/application/dto/UpdateUserDto';
import { UserFakeRepository } from 'user/infrastructure/UserFakeRepository';
import { MockConfigService, ConfigService } from 'config';
import { MockTokenService, TokenService } from 'token';
import { UserApplicationService } from 'user/application/UserApplicationService';
import { UserDomainService } from 'user/domain/UserDomainService';
import { MockEventPublisherService } from 'event';
import { UserModel } from 'user/domain/UserModel';

describe('user service', () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let config: ConfigService;
  let eventPublisher: MockEventPublisherService;
  let userRepository: UserRepository;
  let tokenService: TokenService;
  let userDomainService: UserDomainService;
  let userApplicationService: UserApplicationService;
  let user: UserModel;

  beforeEach(async () => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();
    config = new MockConfigService();
    eventPublisher = new MockEventPublisherService();
    userRepository = new UserFakeRepository();
    tokenService = new MockTokenService();
    userDomainService = new UserDomainService(
      config,
      eventPublisher,
      userRepository,
      tokenService,
    );
    userApplicationService = new UserApplicationService(
      userRepository,
      userDomainService,
    );

    user = modelFaker.user();
    await userRepository.persist(user);
  });

  it('should be defined', () => {
    expect(userApplicationService).toBeDefined();
  });

  describe('get users', () => {
    let query: GetUsersQueryDto;
    let users: UserModel[];
    let expectedUserDtos: UserDto[];

    beforeEach(async () => {
      query = new GetUsersQueryDto();
      users = [modelFaker.user(), modelFaker.user(), modelFaker.user()];
      for (const user of users) {
        user.firstName += 'ann';
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
      const actualUserDto = await userApplicationService.getUser(user, user.id);
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
        anotherUser.id,
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
      jest.spyOn(userDomainService, 'updateUser');
    });

    test('happy path', async () => {
      await userApplicationService.updateAuthUser(user, updateUserDto);
      expect(userDomainService.updateUser).toHaveBeenCalledWith(
        user,
        updateUserDto,
      );
    });
  });

  describe('submit email change', () => {
    let newEmail: string;
    let emailChangeToken: string;

    beforeEach(() => {
      newEmail = primitiveFaker.word();
      emailChangeToken = tokenService.newEmailChangeToken(
        user.id,
        user.email,
        newEmail,
      );
      jest.spyOn(userDomainService, 'submitEmailChange');
    });

    test('happy path', async () => {
      await userApplicationService.submitEmailChange(emailChangeToken);
      expect(userDomainService.submitEmailChange).toHaveBeenCalledWith(
        emailChangeToken,
      );
    });
  });

  describe('delete authenticated user', () => {
    beforeEach(() => {
      jest.spyOn(userDomainService, 'deleteUser');
    });

    test('happy path', async () => {
      await userApplicationService.deleteAuthUser(user);
      expect(userDomainService.deleteUser).toHaveBeenCalledWith(user);
    });
  });
});
