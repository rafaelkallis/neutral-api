import { Test } from '@nestjs/testing';

import {
  ConfigService,
  EmailService,
  RandomService,
  SessionState,
  TokenService,
} from 'common';
import { UserEntity, UserRepository } from 'user';
import { entityFaker, primitiveFaker } from 'test';

import { AuthService } from 'auth/services/auth.service';
import { RefreshDto } from 'auth/dto/refresh.dto';
import { RequestLoginDto } from 'auth/dto/request-login.dto';
import { RequestSignupDto } from 'auth/dto/request-signup.dto';
import { SubmitSignupDto } from 'auth/dto/submit-signup.dto';

describe('auth service', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let emailService: EmailService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthService],
      providers: [
        UserRepository,
        TokenService,
        RandomService,
        EmailService,
        ConfigService,
      ],
    }).compile();

    authService = module.get(AuthService);
    userRepository = module.get(UserRepository);
    emailService = module.get(EmailService);
    tokenService = module.get(TokenService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('request magic login', () => {
    beforeEach(() => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(entityFaker.user());
      jest.spyOn(emailService, 'sendLoginEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      const email = primitiveFaker.email();
      const dto = RequestLoginDto.from({ email });
      await authService.requestLogin(dto);
    });
  });

  describe('submit magic login', () => {
    let user: UserEntity;
    let loginToken: string;
    let session: SessionState;

    beforeEach(() => {
      user = entityFaker.user();
      loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
      session = {
        set: jest.fn(),
        get: jest.fn(),
        exists: jest.fn(),
        clear: jest.fn(),
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'update').mockResolvedValue();
    });

    test('happy path', async () => {
      await expect(
        authService.submitLogin(loginToken, session),
      ).resolves.toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      expect(session.set).toHaveBeenCalled();
    });
  });

  describe('request magic signup', () => {
    beforeEach(() => {
      jest.spyOn(userRepository, 'exists').mockResolvedValue(false);
      jest.spyOn(emailService, 'sendSignupEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      const email = primitiveFaker.email();
      const dto = RequestSignupDto.from({ email });
      await authService.requestSignup(dto);
    });
  });

  describe('submit magic signup', () => {
    let user: UserEntity;
    let signupToken: string;
    let session: SessionState;

    beforeEach(() => {
      user = entityFaker.user();
      signupToken = tokenService.newSignupToken(user.email);
      session = {
        set: jest.fn(),
        get: jest.fn(),
        exists: jest.fn(),
        clear: jest.fn(),
      };
      jest.spyOn(userRepository, 'exists').mockResolvedValue(false);
      jest.spyOn(userRepository, 'insert').mockResolvedValue();
    });

    test('happy path', async () => {
      const { firstName, lastName } = user;
      const dto = SubmitSignupDto.from({ firstName, lastName });
      await expect(
        authService.submitSignup(signupToken, dto, session),
      ).resolves.toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      expect(session.set).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    let user: UserEntity;
    let refreshToken: string;

    beforeEach(() => {
      user = entityFaker.user();
      refreshToken = tokenService.newRefreshToken(user.id);
    });

    test('happy path', async () => {
      const dto = RefreshDto.from({ refreshToken });
      expect(authService.refresh(dto)).toEqual({
        accessToken: expect.any(String),
      });
    });
  });

  describe('logout', () => {
    let session: SessionState;

    beforeEach(() => {
      session = {
        set: jest.fn(),
        get: jest.fn(),
        exists: jest.fn(),
        clear: jest.fn(),
      };
    });

    test('happy path', async () => {
      await authService.logout(session);
      expect(session.clear).toHaveBeenCalled();
    });
  });
});
