import { Test } from '@nestjs/testing';

import { RandomService, TokenService } from 'common';
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
import { TypeOrmUserRepository } from 'user/repositories/typeorm-user.repository';
import { MemoryUserRepository } from 'user/repositories/memory-user.repository';
import { UserModule } from 'user/user.module';
import { EMAIL_SENDER, MockEmailSender } from 'email';

describe('user service', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let userService: UserService;
  let userRepository: UserRepository;
  let mockEmailSender: MockEmailSender;
  let tokenService: TokenService;
  let user: UserEntity;
  let userDto: UserDto;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [UserModule, TestModule],
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useClass: MemoryUserRepository,
        },
        TokenService,
        RandomService,
        {
          provide: EMAIL_SENDER,
          useClass: MockEmailSender,
        },
      ],
    }).compile();

    entityFaker = module.get(EntityFaker);
    primitiveFaker = module.get(PrimitiveFaker);
    userService = module.get(UserService);
    userRepository = module.get(TypeOrmUserRepository);
    mockEmailSender = module.get(EMAIL_SENDER);
    tokenService = module.get(TokenService);
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
      jest.spyOn(mockEmailSender, 'sendEmailChangeEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      await userService.updateUser(user, dto);
      expect(mockEmailSender.sendEmailChangeEmail).toHaveBeenCalledWith(
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
      jest.spyOn(mockEmailSender, 'sendEmailChangeEmail').mockResolvedValue();
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
