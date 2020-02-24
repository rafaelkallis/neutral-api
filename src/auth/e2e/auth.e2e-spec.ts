import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app/AppModule';
import { User } from 'user/domain/User';
import { ModelFaker, PrimitiveFaker } from 'test';
import { TokenManager, TOKEN_MANAGER } from 'token/application/TokenManager';
import { EmailManager, EMAIL_MANAGER } from 'email/EmailManager';

import { USER_REPOSITORY, UserRepository } from 'user/domain/UserRepository';

describe('auth (e2e)', () => {
  let app: INestApplication;
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let userRepository: UserRepository;
  let emailService: EmailManager;
  let tokenService: TokenManager;
  let user: User;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    primitiveFaker = new PrimitiveFaker();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(USER_REPOSITORY);
    emailService = module.get(EMAIL_MANAGER);
    tokenService = module.get(TOKEN_MANAGER);
    app = module.createNestApplication();
    await app.init();

    user = modelFaker.user();
    await userRepository.persist(user);

    session = request.agent(app.getHttpServer());
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    beforeEach(() => {
      jest.spyOn(tokenService, 'newLoginToken');
      jest.spyOn(emailService, 'sendLoginEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      const response = await session
        .post('/auth/login')
        .send({ email: user.email.value });
      expect(response.status).toBe(200);
      expect(tokenService.newLoginToken).toHaveBeenCalledWith(
        user.id,
        user.lastLoginAt,
      );
      expect(emailService.sendLoginEmail).toHaveBeenCalledWith(
        user.email.value,
        expect.any(String),
      );
    });
  });

  describe('/auth/login/:token (POST)', () => {
    let loginToken: string;

    beforeEach(() => {
      loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
      jest.spyOn(tokenService, 'newAccessToken');
      jest.spyOn(tokenService, 'newRefreshToken');
    });

    test('happy path', async () => {
      const response = await session.post(`/auth/login/${loginToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.any(Object),
      });
      expect(tokenService.newAccessToken).toHaveBeenCalledWith(user.id.value);
      expect(tokenService.newRefreshToken).toHaveBeenCalledWith(user.id.value);
      const updatedUser = await userRepository.findById(user.id);
      expect(user.lastLoginAt.value).toBeLessThan(
        updatedUser.lastLoginAt.value,
      );
    });
  });

  describe('/auth/signup (POST)', () => {
    let email: string;

    beforeEach(() => {
      email = primitiveFaker.email();
      jest.spyOn(tokenService, 'newSignupToken');
      jest.spyOn(emailService, 'sendSignupEmail');
    });

    test('happy path', async () => {
      const response = await session.post('/auth/signup').send({ email });
      expect(response.status).toBe(200);
      expect(tokenService.newSignupToken).toHaveBeenCalledWith(email);
      expect(emailService.sendSignupEmail).toHaveBeenCalledWith(
        email,
        expect.any(String),
      );
    });
  });

  describe('/auth/signup/:token (POST)', () => {
    let email: string;
    let signupToken: string;

    beforeEach(() => {
      email = primitiveFaker.email();
      signupToken = tokenService.newSignupToken(email);
      jest.spyOn(tokenService, 'newAccessToken');
      jest.spyOn(tokenService, 'newRefreshToken');
      jest.spyOn(userRepository, 'persist');
    });

    test('happy path', async () => {
      const response = await session.post(`/auth/signup/${signupToken}`).send({
        firstName: primitiveFaker.word(),
        lastName: primitiveFaker.word(),
      });
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.any(Object),
      });
      expect(tokenService.newAccessToken).toHaveBeenCalled();
      expect(tokenService.newRefreshToken).toHaveBeenCalled();
      expect(userRepository.persist).toHaveBeenCalled();
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeEach(() => {
      refreshToken = tokenService.newRefreshToken(user.id.value);
      jest.spyOn(tokenService, 'newAccessToken');
      jest.spyOn(tokenService, 'newRefreshToken');
    });

    test('happy path', async () => {
      const response = await session
        .post('/auth/refresh')
        .send({ refreshToken });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ accessToken: expect.any(String) });
      expect(tokenService.newAccessToken).toHaveBeenCalledWith(user.id.value);
    });
  });

  describe('/auth/logout (POST)', () => {
    beforeEach(async () => {
      const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
      await session.post(`/auth/login/${loginToken}`);
    });

    test('happy path', async () => {
      const logoutResponse = await session.post('/auth/logout');
      expect(logoutResponse.status).toBe(200);
      const meResponse = await session.get('/users/me');
      expect(meResponse.status).toBe(401);
    });
  });
});
