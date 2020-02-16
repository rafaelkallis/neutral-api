import { UserModel, UserRepository, UserFakeRepository } from 'user';
import { ModelFaker, PrimitiveFaker } from 'test';
import { AuthService } from 'auth/application/AuthApplicationService';
import { RefreshDto } from 'auth/application/dto/RefreshDto';
import { RequestLoginDto } from 'auth/application/dto/RequestLoginDto';
import { RequestSignupDto } from 'auth/application/dto/RequestSignupDto';
import { SubmitSignupDto } from 'auth/application/dto/SubmitSignupDto';
import { SessionState } from 'session/session-state';
import { MockSessionState } from 'session';
import { MockConfigService } from 'config';
import { MockTokenService } from 'token';
import { MockEventPublisherService } from 'event';
import { SignupRequestedEvent } from 'auth/application/exceptions/SignupRequestedEvent';
import { SigninEvent } from 'auth/application/exceptions/SigninEvent';
import { SigninRequestedEvent } from 'auth/application/exceptions/SigninRequestedEvent';
import { SignupEvent } from 'auth/application/exceptions/SignupEvent';
import { Email } from 'user/domain/value-objects/Email';

describe('auth service', () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let authService: AuthService;
  let config: MockConfigService;
  let eventPublisher: MockEventPublisherService;
  let userRepository: UserRepository;
  let tokenService: MockTokenService;

  beforeEach(() => {
    modelFaker = new ModelFaker();
    primitiveFaker = new PrimitiveFaker();
    config = new MockConfigService();
    eventPublisher = new MockEventPublisherService();
    userRepository = new UserFakeRepository();
    tokenService = new MockTokenService();

    authService = new AuthService(
      config,
      eventPublisher,
      userRepository,
      tokenService,
    );
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('request magic login', () => {
    let user: UserModel;

    beforeEach(async () => {
      user = modelFaker.user();
      await userRepository.persist(user);
      config.set('FRONTEND_URL', 'https://example.com');
    });

    test('happy path', async () => {
      const email = user.email;
      const requestLoginDto = new RequestLoginDto(email.value);
      await authService.requestLogin(requestLoginDto);
      expect(eventPublisher.getPublishedEvents()).toContainEqual(
        expect.any(SigninRequestedEvent),
      );
    });
  });

  describe('submit magic login', () => {
    let user: UserModel;
    let loginToken: string;
    let session: SessionState;

    beforeEach(async () => {
      user = modelFaker.user();
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
        user: expect.any(Object),
      });
      expect(session.set).toHaveBeenCalled();
      expect(eventPublisher.getPublishedEvents()).toContainEqual(
        expect.any(SigninEvent),
      );
    });
  });

  describe('request magic signup', () => {
    beforeEach(() => {
      jest.spyOn(userRepository, 'exists');
    });

    test('happy path', async () => {
      const email = primitiveFaker.email();
      const dto = new RequestSignupDto(email);
      await authService.requestSignup(dto);
      expect(eventPublisher.getPublishedEvents()).toContainEqual(
        expect.any(SignupRequestedEvent),
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
      submitSignupDto = new SubmitSignupDto(firstName, lastName);
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
        user: expect.any(Object),
      });
      expect(session.set).toHaveBeenCalled();
      expect(userRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          firstName,
          lastName,
        }),
      );
      expect(eventPublisher.getPublishedEvents()).toContainEqual(
        expect.any(SignupEvent),
      );
    });

    test('email already used', async () => {
      const user = modelFaker.user();
      user.email = Email.from(email);
      await userRepository.persist(user);
      await expect(
        authService.submitSignup(signupToken, submitSignupDto, session),
      ).rejects.toThrow();
    });
  });

  describe('refresh', () => {
    let user: UserModel;
    let refreshToken: string;

    beforeEach(() => {
      user = modelFaker.user();
      refreshToken = tokenService.newRefreshToken(user.id.value);
    });

    test('happy path', async () => {
      const dto = new RefreshDto(refreshToken);
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
