import { AuthService } from 'auth/application/AuthApplicationService';
import { RefreshDto } from 'auth/application/dto/RefreshDto';
import { RequestSignupDto } from 'auth/application/dto/RequestSignupDto';
import { SubmitSignupDto } from 'auth/application/dto/SubmitSignupDto';
import { SessionState } from 'shared/session/session-state';
import { MockSessionState } from 'shared/session';
import { MockConfig } from 'shared/config/infrastructure/MockConfig';
import { FakeTokenManagerService } from 'shared/token/infrastructure/FakeTokenManagerService';
import { SignupRequestedEvent } from 'auth/application/events/SignupRequestedEvent';
import { LoginEvent } from 'auth/application/events/LoginEvent';
import { SignupEvent } from 'auth/application/events/SignupEvent';
import { Email } from 'user/domain/value-objects/Email';
import { UserRepository } from 'user/domain/UserRepository';
import { User } from 'user/domain/User';
import { FakeEventPublisherService } from 'shared/event/publisher/FakeEventPublisherService';
import { ModelFaker } from 'test/ModelFaker';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { Mock } from 'test/Mock';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { FakeUserRepository } from 'user/infrastructure/FakeUserRepository';

describe('auth application service', () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let authService: AuthService;
  let config: MockConfig;
  let eventPublisher: FakeEventPublisherService;
  let userRepository: UserRepository;
  let tokenService: FakeTokenManagerService;
  let objectMapper: ObjectMapper;
  let mockUserDto: object;

  beforeEach(() => {
    modelFaker = new ModelFaker();
    primitiveFaker = new PrimitiveFaker();
    config = new MockConfig();
    eventPublisher = new FakeEventPublisherService();
    userRepository = new FakeUserRepository();
    tokenService = new FakeTokenManagerService();
    objectMapper = Mock(ObjectMapper);

    authService = new AuthService(
      config,
      eventPublisher,
      userRepository,
      tokenService,
      objectMapper,
    );

    mockUserDto = {};
    jest.spyOn(objectMapper, 'map').mockReturnValue(mockUserDto);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('submit magic login', () => {
    let user: User;
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
        expect.any(LoginEvent),
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
        user: mockUserDto,
      });
      expect(session.set).toHaveBeenCalled();
      // TODO better persist() assertion
      expect(userRepository.persist).toHaveBeenCalled();
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
    let user: User;
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
