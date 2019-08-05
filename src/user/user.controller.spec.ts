import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import {
  UserRepository,
  ProjectRepository,
  RandomService,
  TokenService,
  ConfigService,
  EmailService,
} from '../common';

describe('User Controller', () => {
  let userController: UserController;

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

    userController = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });
});
