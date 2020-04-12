import { TestScenario } from 'test/TestScenario';
import { User } from 'user/domain/User';
import { HttpStatus } from '@nestjs/common';
import { Email } from 'user/domain/value-objects/Email';

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
      jest.spyOn(scenario.emailManager, 'sendLoginEmail');
    });

    test('happy path', async () => {
      const response = await scenario.session
        .post('/auth/login')
        .send({ email: user.email.value });
      expect(response.status).toBe(HttpStatus.NO_CONTENT);
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
    });

    test('happy path', async () => {
      const response = await scenario.session.post(`/auth/login/${loginToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.objectContaining({ id: user.id.value }),
      });
      const updatedUser = await scenario.userRepository.findById(user.id);
      if (!updatedUser) {
        fail();
      }
      expect(user.lastLoginAt.value).toBeLessThan(
        updatedUser.lastLoginAt.value,
      );
    });
  });

  describe('/auth/signup (POST)', () => {
    let email: string;

    beforeEach(() => {
      email = scenario.primitiveFaker.email();
      jest.spyOn(scenario.emailManager, 'sendSignupEmail');
    });

    test('happy path', async () => {
      const response = await scenario.session
        .post('/auth/signup')
        .send({ email });
      expect(response.status).toBe(HttpStatus.NO_CONTENT);
      expect(scenario.emailManager.sendSignupEmail).toHaveBeenCalledWith(
        email,
        expect.any(String),
      );
    });
  });

  describe('/auth/signup/:token (POST)', () => {
    let email: string;
    let signupToken: string;
    let firstName: string;
    let lastName: string;

    beforeEach(() => {
      email = scenario.primitiveFaker.email();
      signupToken = scenario.tokenManager.newSignupToken(email);
      firstName = scenario.primitiveFaker.word();
      lastName = scenario.primitiveFaker.word();
    });

    test('happy path', async () => {
      const response = await scenario.session
        .post(`/auth/signup/${signupToken}`)
        .send({ firstName, lastName });
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.objectContaining({ email, firstName, lastName }),
      });
      const optionalCreatedUser = await scenario.userRepository.findByEmail(
        Email.from(email),
      );
      expect(optionalCreatedUser.isPresent()).toBeTruthy();
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeEach(() => {
      refreshToken = scenario.tokenManager.newRefreshToken(user.id.value);
    });

    test('happy path', async () => {
      const response = await scenario.session
        .post('/auth/refresh')
        .send({ refreshToken });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ accessToken: expect.any(String) });
    });
  });

  describe('/auth/logout (POST)', () => {
    beforeEach(async () => {
      await scenario.authenticateUser(user);
    });

    test('happy path', async () => {
      const logoutResponse = await scenario.session.post('/auth/logout');
      expect(logoutResponse.status).toBe(HttpStatus.NO_CONTENT);
      const meResponse = await scenario.session.get('/users/me');
      expect(meResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
