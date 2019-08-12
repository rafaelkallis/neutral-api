import { Test, TestingModule } from '@nestjs/testing';

import {
  ConfigService,
  EmailService,
  RandomService,
  SessionState,
  TokenService,
  User,
  UserRepository,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';

import { AuthController } from './auth.controller';
import { RefreshDto } from './dto/refresh.dto';
import { RequestLoginDto } from './dto/request-login.dto';
import { RequestSignupDto } from './dto/request-signup.dto';
import { SubmitSignupDto } from './dto/submit-signup.dto';

describe('Auth Controller', () => {
  let authController: AuthController;
  let userRepository: UserRepository;
  let emailService: EmailService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        UserRepository,
        TokenService,
        RandomService,
        EmailService,
        ConfigService,
      ],
    }).compile();

    authController = module.get(AuthController);
    userRepository = module.get(UserRepository);
    emailService = module.get(EmailService);
    tokenService = module.get(TokenService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('request magic login', () => {
    beforeEach(() => {
      jest
        .spyOn(userRepository, 'findOneOrFail')
        .mockResolvedValue(entityFaker.user());
      jest.spyOn(emailService, 'sendLoginEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      const dto = new RequestLoginDto();
      dto.email = primitiveFaker.email();
      await authController.requestLogin(dto);
    });
  });

  describe('submit magic login', () => {
    let user: User;
    let loginToken: string;
    let session: SessionState;

    beforeEach(() => {
      user = entityFaker.user();
      loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
      session = {
        set: jest.fn(),
        get: jest.fn(),
        clear: jest.fn(),
      };
      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
    });

    test('happy path', async () => {
      await expect(
        authController.submitLogin(loginToken, session),
      ).resolves.toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      expect(session.set).toHaveBeenCalled();
    });
  });

  describe('request magic signup', () => {
    beforeEach(() => {
      jest.spyOn(userRepository, 'count').mockResolvedValue(0);
      jest.spyOn(emailService, 'sendSignupEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      const dto = new RequestSignupDto();
      dto.email = primitiveFaker.email();
      await authController.requestSignup(dto);
    });
  });

  describe('submit magic signup', () => {
    let user: User;
    let signupToken: string;
    let session: SessionState;

    beforeEach(() => {
      user = entityFaker.user();
      signupToken = tokenService.newSignupToken(user.email);
      session = {
        set: jest.fn(),
        get: jest.fn(),
        clear: jest.fn(),
      };
      jest.spyOn(userRepository, 'count').mockResolvedValue(0);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
    });

    test('happy path', async () => {
      const dto = new SubmitSignupDto();
      dto.firstName = user.firstName;
      dto.lastName = user.lastName;
      await expect(
        authController.submitSignup(signupToken, dto, session),
      ).resolves.toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      expect(session.set).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    let user: User;
    let refreshToken: string;
    let session: SessionState;

    beforeEach(() => {
      user = entityFaker.user();
      refreshToken = tokenService.newRefreshToken(user.id);
      session = {
        set: jest.fn(),
        get: jest.fn(),
        clear: jest.fn(),
      };
    });

    test('happy path', async () => {
      const dto = new RefreshDto();
      dto.refreshToken = refreshToken;
      expect(authController.refresh(dto, session)).toEqual({
        accessToken: expect.any(String),
      });
      expect(session.set).toHaveBeenCalled();
    });
  });
});
