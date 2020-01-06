import { Test } from '@nestjs/testing';

import {
  UserEntity,
  UserRepository,
  USER_REPOSITORY,
  MockUserRepository,
} from 'user';
import { EntityFaker, PrimitiveFaker } from 'test';
import { TestModule } from 'test/test.module';

import { AuthService } from 'auth/services/auth.service';
import { RefreshDto } from 'auth/dto/refresh.dto';
import { RequestLoginDto } from 'auth/dto/request-login.dto';
import { RequestSignupDto } from 'auth/dto/request-signup.dto';
import { SubmitSignupDto } from 'auth/dto/submit-signup.dto';
import { EMAIL_SENDER, MockEmailSender } from 'email';
import { SessionState } from 'session/session-state';
import { MockSessionState } from 'session';
import { AuthModule } from 'auth/auth.module';
import { CONFIG, MockConfig } from 'config';
import { MockTokenService, TOKEN_SERVICE } from 'token';

describe('auth service', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let authService: AuthService;
  let userRepository: UserRepository;
  let mockEmailSender: MockEmailSender;
  let tokenService: MockTokenService;

  beforeEach(async () => {
    mockEmailSender = new MockEmailSender();
    userRepository = new MockUserRepository();
    tokenService = new MockTokenService();
    const module = await Test.createTestingModule({
      imports: [AuthModule, TestModule],
    })
      .overrideProvider(CONFIG)
      .useClass(MockConfig)
      .overrideProvider(USER_REPOSITORY)
      .useValue(userRepository)
      .overrideProvider(TOKEN_SERVICE)
      .useValue(tokenService)
      .overrideProvider(EMAIL_SENDER)
      .useValue(mockEmailSender)
      .compile();

    entityFaker = module.get(EntityFaker);
    primitiveFaker = module.get(PrimitiveFaker);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('request magic login', () => {
    beforeEach(() => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(entityFaker.user());
      jest.spyOn(mockEmailSender, 'sendLoginEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      const email = primitiveFaker.email();
      const dto = RequestLoginDto.from({ email });
      await expect(authService.requestLogin(dto)).resolves.not.toThrow();
    });
  });

  describe('submit magic login', () => {
    let user: UserEntity;
    let loginToken: string;
    let session: SessionState;

    beforeEach(() => {
      user = entityFaker.user();
      loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
      session = new MockSessionState();
      jest.spyOn(session, 'set');
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'persist').mockResolvedValue();
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
      jest.spyOn(mockEmailSender, 'sendSignupEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      const email = primitiveFaker.email();
      const dto = RequestSignupDto.from({ email });
      await expect(authService.requestSignup(dto)).resolves.not.toThrow();
    });
  });

  describe('submit magic signup', () => {
    let user: UserEntity;
    let signupToken: string;
    let session: SessionState;

    beforeEach(() => {
      user = entityFaker.user();
      signupToken = tokenService.newSignupToken(user.email);
      session = new MockSessionState();
      jest.spyOn(session, 'set');
      jest.spyOn(userRepository, 'exists').mockResolvedValue(false);
      jest.spyOn(userRepository, 'persist').mockResolvedValue();
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
      session = new MockSessionState();
      jest.spyOn(session, 'clear');
    });

    test('happy path', async () => {
      await authService.logout(session);
      expect(session.clear).toHaveBeenCalled();
    });
  });
});
