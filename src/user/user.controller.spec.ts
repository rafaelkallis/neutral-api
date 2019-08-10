import { Test, TestingModule } from '@nestjs/testing';

import {
  ConfigService,
  EmailService,
  ProjectRepository,
  RandomService,
  TokenService,
  User,
  UserRepository,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';

import { PatchUserDto } from './dto/patch-user.dto';
import { UserController } from './user.controller';

describe('User Controller', () => {
  let userController: UserController;
  let userRepository: UserRepository;
  let emailService: EmailService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserRepository,
        ProjectRepository,
        TokenService,
        RandomService,
        ConfigService,
        EmailService,
      ],
    }).compile();

    userController = module.get(UserController);
    userRepository = module.get(UserRepository);
    emailService = module.get(EmailService);
    tokenService = module.get(TokenService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('get users', () => {
    let users: User[];

    beforeEach(() => {
      users = [
        entityFaker.user(),
        entityFaker.user(),
        entityFaker.user(),
      ];
      jest.spyOn(userRepository, 'find').mockResolvedValue(users);
    });

    test('happy path', async () => {
      await expect(userController.getUsers()).resolves.toEqual(users);
    });
  });

  describe('get auth user', () => {
    let user: User;

    beforeEach(() => {
      user = entityFaker.user();
    });

    test('happy path', async () => {
      await expect(userController.getAuthUser(user)).resolves.toEqual(user);
    });
  });

  describe('patch auth user', () => {
    let user: User;
    let newEmail: string;
    let newFirstName: string;
    let dto: PatchUserDto;

    beforeEach(() => {
      user = entityFaker.user();
      newEmail = primitiveFaker.email();
      newFirstName = primitiveFaker.word();
      dto = new PatchUserDto();
      dto.email = newEmail;
      dto.firstName = newFirstName;
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest.spyOn(emailService, 'sendEmailChangeEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      await expect(userController.patchAuthUser(user, dto)).resolves.toEqual(
        user,
      );
    });
  });

  describe('submit email change', () => {
    let user: User;
    let newEmail: string;
    let emailChangeToken: string;

    beforeEach(() => {
      user = entityFaker.user();
      newEmail = primitiveFaker.word();
      emailChangeToken = tokenService.newEmailChangeToken(
        user.id,
        user.email,
        newEmail,
      );
      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest.spyOn(emailService, 'sendEmailChangeEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      await userController.submitEmailChange(emailChangeToken);
    });
  });

  describe('get user', () => {
    let user: User;

    beforeEach(() => {
      user = entityFaker.user();
      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(user);
    });

    test('happy path', async () => {
      await expect(userController.getUser(user.id)).resolves.toEqual(user);
    });
  });

  describe('delete authenticated user', () => {
    let user: User;

    beforeEach(async () => {
      user = entityFaker.user();
      jest.spyOn(userRepository, 'remove').mockResolvedValue(user);
    });

    test('happy path', async () => {
      await userController.deleteAuthUser(user);
      expect(userRepository.remove).toHaveBeenCalledWith(user);
    });
  });
});
