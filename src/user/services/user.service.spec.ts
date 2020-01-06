import { Test } from '@nestjs/testing';

import { EntityFaker, PrimitiveFaker } from 'test';
import { TestModule } from 'test/test.module';
import { UserEntity } from 'user/entities/user.entity';
import {
  UserRepository,
  USER_REPOSITORY,
} from 'user/repositories/user.repository';
import { UserDto } from 'user/dto/user.dto';
import { GetUsersQueryDto } from 'user/dto/get-users-query.dto';
import { UpdateUserDto } from 'user/dto/update-user.dto';
import { UserService } from 'user/services/user.service';
import { MockUserRepository } from 'user/repositories/mock-user.repository';
import { UserModule } from 'user/user.module';
import { EMAIL_SENDER, MockEmailSender, EmailSender } from 'email';
import { CONFIG, MockConfig } from 'config';
import { TOKEN_SERVICE, MockTokenService, TokenService } from 'token';

describe('user service', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let userService: UserService;
  let userRepository: UserRepository;
  let emailSender: EmailSender;
  let tokenService: TokenService;
  let user: UserEntity;
  let userDto: UserDto;

  beforeEach(async () => {
    userRepository = new MockUserRepository();
    emailSender = new MockEmailSender();
    tokenService = new MockTokenService();
    const module = await Test.createTestingModule({
      imports: [UserModule, TestModule],
    })
      .overrideProvider(CONFIG)
      .useClass(MockConfig)
      .overrideProvider(USER_REPOSITORY)
      .useValue(userRepository)
      .overrideProvider(EMAIL_SENDER)
      .useValue(emailSender)
      .overrideProvider(TOKEN_SERVICE)
      .useValue(tokenService)
      .compile();

    entityFaker = module.get(EntityFaker);
    primitiveFaker = module.get(PrimitiveFaker);
    userService = module.get(UserService);
    user = entityFaker.user();
    userDto = UserDto.builder()
      .user(user)
      .authUser(user)
      .build();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('get users', () => {
    let query: GetUsersQueryDto;
    let users: UserEntity[];
    let userDtos: UserDto[];

    beforeEach(() => {
      query = GetUsersQueryDto.from({});
      users = [entityFaker.user(), entityFaker.user(), entityFaker.user()];
      userDtos = users.map(u =>
        UserDto.builder()
          .user(u)
          .authUser(user)
          .build(),
      );
      jest.spyOn(userRepository, 'findPage').mockResolvedValue(users);
      jest.spyOn(userRepository, 'findByName').mockResolvedValue(users);
    });

    test('happy path', async () => {
      await expect(userService.getUsers(user, query)).resolves.toEqual(
        userDtos,
      );
      expect(userRepository.findPage).toHaveBeenCalled();
    });

    test('happy path, text search', async () => {
      query = GetUsersQueryDto.from({ q: 'ann' });
      await expect(userService.getUsers(user, query)).resolves.toEqual(
        userDtos,
      );
      expect(userRepository.findByName).toHaveBeenCalled();
    });
  });

  describe('get auth user', () => {
    test('happy path', async () => {
      await expect(userService.getAuthUser(user)).resolves.toEqual(userDto);
    });
  });

  describe('update user', () => {
    let email: string;
    let firstName: string;
    let dto: UpdateUserDto;

    beforeEach(() => {
      email = primitiveFaker.email();
      firstName = primitiveFaker.word();
      dto = UpdateUserDto.from({ email, firstName });
      jest.spyOn(userRepository, 'persist').mockResolvedValue();
      // jest.spyOn(userRepository, 'update').mockResolvedValue();
      jest.spyOn(emailSender, 'sendEmailChangeEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      await userService.updateUser(user, dto);
      expect(emailSender.sendEmailChangeEmail).toHaveBeenCalledWith(
        email,
        expect.any(String),
      );
      expect(userRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ firstName }),
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
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'persist').mockResolvedValue();
      jest.spyOn(emailSender, 'sendEmailChangeEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      await userService.submitEmailChange(emailChangeToken);
      // TODO something more here?
    });
  });

  describe('get user', () => {
    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    });

    test('happy path', async () => {
      await expect(userService.getUser(user, user.id)).resolves.toEqual(
        userDto,
      );
    });

    test('should not expose email of another user', async () => {
      const otherUser = entityFaker.user();
      const otherUserDto = UserDto.builder()
        .user(otherUser)
        .authUser(user)
        .build();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(otherUser);
      await expect(userService.getUser(user, otherUser.id)).resolves.toEqual(
        otherUserDto,
      );
    });
  });

  describe('delete authenticated user', () => {
    beforeEach(async () => {
      jest.spyOn(userRepository, 'delete').mockResolvedValue();
    });

    test('happy path', async () => {
      await userService.deleteAuthUser(user);
      expect(userRepository.delete).toHaveBeenCalledWith(user);
    });
  });
});
