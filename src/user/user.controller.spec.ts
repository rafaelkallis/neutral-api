import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { UserController } from './user.controller';
import {
  User,
  UserRepository,
  ProjectRepository,
  RandomService,
  TokenService,
  ConfigService,
  EmailService,
} from '../common';
import { entityFaker } from '../test';
import { PatchUserDto } from './dto/patch-user.dto';

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
        entityFaker.newUser(),
        entityFaker.newUser(),
        entityFaker.newUser(),
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
      user = entityFaker.newUser();
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
      user = entityFaker.newUser();
      newEmail = faker.internet.email();
      newFirstName = faker.name.firstName();
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
      user = entityFaker.newUser();
      newEmail = faker.internet.email();
      emailChangeToken = tokenService.newEmailChangeToken(
        user.id,
        user.email,
        newEmail,
      );
      jest.spyOn(userRepository, 'findOneOrFailWith').mockResolvedValue(user);
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
      user = entityFaker.newUser();
      jest.spyOn(userRepository, 'findOneOrFailWith').mockResolvedValue(user);
    });

    test('happy path', async () => {
      await expect(userController.getUser(user.id)).resolves.toEqual(user);
    });
  });
});
