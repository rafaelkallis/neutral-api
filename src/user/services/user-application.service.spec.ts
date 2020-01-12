import { EntityFaker, PrimitiveFaker } from 'test';
import { UserEntity } from 'user/entities/user.entity';
import { UserRepository } from 'user/repositories/user.repository';
import { UserDto } from 'user/dto/user.dto';
import { GetUsersQueryDto } from 'user/dto/get-users-query.dto';
import { UpdateUserDto } from 'user/dto/update-user.dto';
import { FakeUserRepository } from 'user/repositories/fake-user.repository';
import { MockEmailSender, EmailSender } from 'email';
import { MockConfig, Config } from 'config';
import { MockTokenService, TokenService } from 'token';
import { UserApplicationService } from 'user/services/user-application.service';
import { UserDomainService } from 'user/services/user-domain.service';
import { MockEventPublisher } from 'event';

describe('user service', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let config: Config;
  let eventPublisher: MockEventPublisher;
  let userRepository: UserRepository;
  let emailSender: EmailSender;
  let tokenService: TokenService;
  let userDomainService: UserDomainService;
  let userApplicationService: UserApplicationService;
  let user: UserEntity;

  beforeEach(async () => {
    primitiveFaker = new PrimitiveFaker();
    entityFaker = new EntityFaker();
    config = new MockConfig();
    eventPublisher = new MockEventPublisher();
    userRepository = new FakeUserRepository();
    emailSender = new MockEmailSender();
    tokenService = new MockTokenService();
    userDomainService = new UserDomainService(
      config,
      eventPublisher,
      userRepository,
      tokenService,
      emailSender,
    );
    userApplicationService = new UserApplicationService(
      userRepository,
      userDomainService,
    );

    user = entityFaker.user();
    await userRepository.persist(user);
  });

  it('should be defined', () => {
    expect(userApplicationService).toBeDefined();
  });

  describe('get users', () => {
    let query: GetUsersQueryDto;
    let users: UserEntity[];
    let expectedUserDtos: UserDto[];

    beforeEach(async () => {
      query = GetUsersQueryDto.from({});
      users = [entityFaker.user(), entityFaker.user(), entityFaker.user()];
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
      query = GetUsersQueryDto.from({ q: 'ann' });
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
      const anotherUser = entityFaker.user();
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
      updateUserDto = UpdateUserDto.from({ email, firstName });
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
