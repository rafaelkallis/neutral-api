import { TestScenario } from 'test/TestScenario';
import { User } from 'user/domain/User';

describe('auth (e2e)', () => {
  let scenario: TestScenario;
  let user: User;

  beforeEach(async () => {
    scenario = await TestScenario.create();
    user = await scenario.createUser();
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  describe('/auth/login (POST)', () => {
    beforeEach(() => {
      jest.spyOn(scenario.tokenManager, 'newLoginToken');
      jest.spyOn(scenario.emailManager, 'sendLoginEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      const response = await scenario.session
        .post('/auth/login')
        .send({ email: user.email.value });
      expect(response.status).toBe(200);
      expect(scenario.tokenManager.newLoginToken).toHaveBeenCalledWith(
        user.id,
        user.lastLoginAt,
      );
      expect(scenario.emailManager.sendLoginEmail).toHaveBeenCalledWith(
        user.email.value,
        expect.any(String),
      );
    });
  });

  describe('/auth/login/:token (POST)', () => {
    let loginToken: string;

    beforeEach(() => {
      loginToken = scenario.tokenManager.newLoginToken(
        user.id,
        user.lastLoginAt,
      );
      jest.spyOn(scenario.tokenManager, 'newAccessToken');
      jest.spyOn(scenario.tokenManager, 'newRefreshToken');
    });

    test('happy path', async () => {
      const response = await scenario.session.post(`/auth/login/${loginToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.any(Object),
      });
      expect(scenario.tokenManager.newAccessToken).toHaveBeenCalledWith(
        user.id.value,
      );
      expect(scenario.tokenManager.newRefreshToken).toHaveBeenCalledWith(
        user.id.value,
      );
      const updatedUser = await scenario.userRepository.findById(user.id);
      expect(user.lastLoginAt.value).toBeLessThan(
        updatedUser.lastLoginAt.value,
      );
    });
  });

  describe('/auth/signup (POST)', () => {
    let email: string;

    beforeEach(() => {
      email = scenario.primitiveFaker.email();
      jest.spyOn(scenario.tokenManager, 'newSignupToken');
      jest.spyOn(scenario.emailManager, 'sendSignupEmail');
    });

    test('happy path', async () => {
      const response = await scenario.session
        .post('/auth/signup')
        .send({ email });
      expect(response.status).toBe(200);
      expect(scenario.tokenManager.newSignupToken).toHaveBeenCalledWith(email);
      expect(scenario.emailManager.sendSignupEmail).toHaveBeenCalledWith(
        email,
        expect.any(String),
      );
    });
  });

  describe('/auth/signup/:token (POST)', () => {
    let email: string;
    let signupToken: string;

    beforeEach(() => {
      email = scenario.primitiveFaker.email();
      signupToken = scenario.tokenManager.newSignupToken(email);
      jest.spyOn(scenario.tokenManager, 'newAccessToken');
      jest.spyOn(scenario.tokenManager, 'newRefreshToken');
      jest.spyOn(scenario.userRepository, 'persist');
    });

    test('happy path', async () => {
      const response = await scenario.session
        .post(`/auth/signup/${signupToken}`)
        .send({
          firstName: scenario.primitiveFaker.word(),
          lastName: scenario.primitiveFaker.word(),
        });
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.any(Object),
      });
      expect(scenario.tokenManager.newAccessToken).toHaveBeenCalled();
      expect(scenario.tokenManager.newRefreshToken).toHaveBeenCalled();
      expect(scenario.userRepository.persist).toHaveBeenCalled();
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeEach(() => {
      refreshToken = scenario.tokenManager.newRefreshToken(user.id.value);
      jest.spyOn(scenario.tokenManager, 'newAccessToken');
      jest.spyOn(scenario.tokenManager, 'newRefreshToken');
    });

    test('happy path', async () => {
      const response = await scenario.session
        .post('/auth/refresh')
        .send({ refreshToken });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ accessToken: expect.any(String) });
      expect(scenario.tokenManager.newAccessToken).toHaveBeenCalledWith(
        user.id.value,
      );
    });
  });

  describe('/auth/logout (POST)', () => {
    beforeEach(async () => {
      const loginToken = scenario.tokenManager.newLoginToken(
        user.id,
        user.lastLoginAt,
      );
      await scenario.session.post(`/auth/login/${loginToken}`);
    });

    test('happy path', async () => {
      const logoutResponse = await scenario.session.post('/auth/logout');
      expect(logoutResponse.status).toBe(200);
      const meResponse = await scenario.session.get('/users/me');
      expect(meResponse.status).toBe(401);
    });
  });
});
