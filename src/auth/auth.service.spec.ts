import { Test } from '@nestjs/testing';

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

import { AuthService } from './auth.service';
import { RefreshDto } from './dto/refresh.dto';
import { RequestLoginDto } from './dto/request-login.dto';
import { RequestSignupDto } from './dto/request-signup.dto';
import { SubmitSignupDto } from './dto/submit-signup.dto';

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
        .spyOn(userRepository, 'findOneOrFail')
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
      jest.spyOn(userRepository, 'count').mockResolvedValue(0);
      jest.spyOn(emailService, 'sendSignupEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      const email = primitiveFaker.email();
      const dto = RequestSignupDto.from({ email });
      await authService.requestSignup(dto);
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
      const dto = RefreshDto.from({ refreshToken });
      expect(authService.refresh(dto, session)).toEqual({
        accessToken: expect.any(String),
      });
      expect(session.set).toHaveBeenCalled();
    });
  });
});
