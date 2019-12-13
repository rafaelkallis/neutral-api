import { Test } from '@nestjs/testing';

import {
  ConfigService,
  EmailService,
  RandomService,
  TokenService,
} from 'common';
import { entityFaker, primitiveFaker } from 'test';
import { UserEntity } from 'user/entities/user.entity';
import { UserRepository } from 'user/repositories/user.repository';
import { UserDto, UserDtoBuilder } from 'user/dto/user.dto';
import { GetUsersQueryDto } from 'user/dto/get-users-query.dto';
import { UpdateUserDto } from 'user/dto/update-user.dto';
import { UserService } from 'user/services/user.service';

describe('user service', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let emailService: EmailService;
  let tokenService: TokenService;
  let user: UserEntity;
  let userDto: UserDto;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        UserRepository,
        TokenService,
        RandomService,
        ConfigService,
        EmailService,
      ],
    }).compile();

    userService = module.get(UserService);
    userRepository = module.get(UserRepository);
    emailService = module.get(EmailService);
    tokenService = module.get(TokenService);
    user = entityFaker.user();
    userDto = new UserDtoBuilder(user, user).build();
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
      userDtos = users.map(u => new UserDtoBuilder(u, user).build());
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
      jest.spyOn(userRepository, 'update').mockResolvedValue();
      jest.spyOn(emailService, 'sendEmailChangeEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      await userService.updateUser(user, dto);
      expect(emailService.sendEmailChangeEmail).toHaveBeenCalledWith(
        email,
        expect.any(String),
      );
      expect(userRepository.update).toHaveBeenCalledWith(
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
      jest.spyOn(userRepository, 'update').mockResolvedValue();
      jest.spyOn(emailService, 'sendEmailChangeEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      await userService.submitEmailChange(emailChangeToken);
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
      const otherUserDto = new UserDtoBuilder(otherUser, user).build();
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
