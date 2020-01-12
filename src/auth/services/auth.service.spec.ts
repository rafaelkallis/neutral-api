import { UserEntity, UserRepository, FakeUserRepository } from 'user';
import { EntityFaker, PrimitiveFaker } from 'test';

import { AuthService } from 'auth/services/auth.service';
import { RefreshDto } from 'auth/dto/refresh.dto';
import { RequestLoginDto } from 'auth/dto/request-login.dto';
import { RequestSignupDto } from 'auth/dto/request-signup.dto';
import { SubmitSignupDto } from 'auth/dto/submit-signup.dto';
import { MockEmailSender } from 'email';
import { SessionState } from 'session/session-state';
import { MockSessionState } from 'session';
import { MockConfig } from 'config';
import { MockTokenService } from 'token';
import { MockEventPublisher } from 'event';

describe('auth service', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let authService: AuthService;
  let config: MockConfig;
  let eventPublisher: MockEventPublisher;
  let userRepository: UserRepository;
  let emailSender: MockEmailSender;
  let tokenService: MockTokenService;

  beforeEach(() => {
    entityFaker = new EntityFaker();
    primitiveFaker = new PrimitiveFaker();
    config = new MockConfig();
    eventPublisher = new MockEventPublisher();
    emailSender = new MockEmailSender();
    userRepository = new FakeUserRepository();
    tokenService = new MockTokenService();

    authService = new AuthService(
      config,
      eventPublisher,
      userRepository,
      tokenService,
      emailSender,
    );
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('request magic login', () => {
    let user: UserEntity;

    beforeEach(async () => {
      user = entityFaker.user();
      await userRepository.persist(user);
      config.set('FRONTEND_URL', 'https://example.com');
      jest.spyOn(emailSender, 'sendLoginEmail');
    });

    test('happy path', async () => {
      const email = user.email;
      const requestLoginDto = RequestLoginDto.from({ email });
      await authService.requestLogin(requestLoginDto);
      expect(emailSender.sendLoginEmail).toHaveBeenCalledWith(
        email,
        expect.any(String),
      );
    });
  });

  describe('submit magic login', () => {
    let user: UserEntity;
    let loginToken: string;
    let session: SessionState;

    beforeEach(async () => {
      user = entityFaker.user();
      await userRepository.persist(user);
      loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
      session = new MockSessionState();
      jest.spyOn(session, 'set');
      jest.spyOn(userRepository, 'persist');
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
      jest.spyOn(userRepository, 'exists');
      jest.spyOn(emailSender, 'sendSignupEmail');
    });

    test('happy path', async () => {
      const email = primitiveFaker.email();
      const dto = RequestSignupDto.from({ email });
      await authService.requestSignup(dto);
      expect(emailSender.sendSignupEmail).toHaveBeenCalledWith(
        email,
        expect.any(String),
      );
    });
  });

  describe('submit magic signup', () => {
    let email: string;
    let firstName: string;
    let lastName: string;
    let signupToken: string;
    let submitSignupDto: SubmitSignupDto;
    let session: SessionState;

    beforeEach(async () => {
      email = primitiveFaker.email();
      firstName = primitiveFaker.word();
      lastName = primitiveFaker.word();
      signupToken = tokenService.newSignupToken(email);
      submitSignupDto = SubmitSignupDto.from({ firstName, lastName });
      session = new MockSessionState();
      jest.spyOn(session, 'set');
      jest.spyOn(userRepository, 'persist');
    });

    test('happy path', async () => {
      await expect(
        authService.submitSignup(signupToken, submitSignupDto, session),
      ).resolves.toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      expect(session.set).toHaveBeenCalled();
      expect(userRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          firstName,
          lastName,
        }),
      );
    });

    test('email already used', async () => {
      const user = entityFaker.user();
      user.email = email;
      await userRepository.persist(user);
      await expect(
        authService.submitSignup(signupToken, submitSignupDto, session),
      ).rejects.toThrow();
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
