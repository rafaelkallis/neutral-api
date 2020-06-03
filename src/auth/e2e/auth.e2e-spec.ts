import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { HttpStatus } from '@nestjs/common';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { Email } from 'user/domain/value-objects/Email';

describe('auth (e2e)', () => {
  let scenario: IntegrationTestScenario;
  let user: User;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    user = await scenario.createUser();
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  describe('/auth/login (POST)', () => {
    test('active user', async () => {
      const response = await scenario.session
        .post('/auth/login')
        .send({ email: user.email.value });
      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const receivedEmails = await scenario.getReceivedEmails(user.email);
      expect(receivedEmails).toHaveLength(1);
      expect(receivedEmails[0].subject).toBe('[Covee] magic login link');
    });

    test('new user', async () => {
      const newUserEmail = scenario.valueObjectFaker.user.email();
      const response = await scenario.session
        .post('/auth/login')
        .send({ email: newUserEmail.value });
      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const receivedEmails = await scenario.getReceivedEmails(newUserEmail);
      expect(receivedEmails).toHaveLength(1);
      expect(receivedEmails[0].subject).toBe('[Covee] magic signup link');
    });
  });

  describe('/auth/login/:token (POST)', () => {
    let loginToken: string;

    beforeEach(() => {
      loginToken = scenario.tokenManager.newLoginToken(
        user.email,
        user.lastLoginAt,
      );
    });

    test('active user', async () => {
      const response = await scenario.session.post(`/auth/login/${loginToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.objectContaining({ id: user.id.value }),
      });
      const updatedUser = await scenario.userRepository.findById(user.id);
      if (!updatedUser) {
        throw new Error();
      }
      expect(user.lastLoginAt.value).toBeLessThan(
        updatedUser.lastLoginAt.value,
      );
    });

    test('new user', async () => {
      const email = scenario.valueObjectFaker.user.email();
      const lastLoginAt = LastLoginAt.never();
      loginToken = scenario.tokenManager.newLoginToken(email, lastLoginAt);
      const response = await scenario.session.post(`/auth/login/${loginToken}`);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.objectContaining({ email: email.value }),
      });
      const createdUser = await scenario.userRepository.findByEmail(email);
      if (!createdUser) {
        throw new Error();
      }
      expect(lastLoginAt.value).toBeLessThan(createdUser.lastLoginAt.value);
    });
  });

  describe('/auth/signup (POST)', () => {
    let email: Email;

    beforeEach(() => {
      email = scenario.valueObjectFaker.user.email();
    });

    test('happy path', async () => {
      const response = await scenario.session
        .post('/auth/signup')
        .send({ email: email.value });
      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const receivedEmails = await scenario.getReceivedEmails(email);
      expect(receivedEmails).toHaveLength(1);
      expect(receivedEmails[0].subject).toBe('[Covee] magic signup link');
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
