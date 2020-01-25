import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { UserEntity, UserRepository, USER_REPOSITORY } from 'user';
import { EntityFaker, PrimitiveFaker } from 'test';
import { TokenService, TOKEN_SERVICE } from 'token';
import { EmailService, EMAIL_SERVICE } from 'email';

describe('auth (e2e)', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let userRepository: UserRepository;
  let emailService: EmailService;
  let tokenService: TokenService;
  let user: UserEntity;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    primitiveFaker = new PrimitiveFaker();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(USER_REPOSITORY);
    emailService = module.get(EMAIL_SERVICE);
    tokenService = module.get(TOKEN_SERVICE);
    const app = module.createNestApplication();
    await app.init();

    user = entityFaker.user();
    await userRepository.persist(user);

    session = request.agent(app.getHttpServer());
  });

  describe('/auth/login (POST)', () => {
    beforeEach(() => {
      jest.spyOn(tokenService, 'newLoginToken');
      jest.spyOn(emailService, 'sendLoginEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      const response = await session
        .post('/auth/login')
        .send({ email: user.email });
      expect(response.status).toBe(200);
      expect(tokenService.newLoginToken).toHaveBeenCalledWith(
        user.id,
        user.lastLoginAt,
      );
      expect(emailService.sendLoginEmail).toHaveBeenCalledWith(
        user.email,
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
      expect(tokenService.newAccessToken).toHaveBeenCalledWith(user.id);
      expect(tokenService.newRefreshToken).toHaveBeenCalledWith(user.id);
      const updatedUser = await userRepository.findById(user.id);
      expect(user.lastLoginAt).toBeLessThan(updatedUser.lastLoginAt);
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
      refreshToken = tokenService.newRefreshToken(user.id);
      jest.spyOn(tokenService, 'newAccessToken');
      jest.spyOn(tokenService, 'newRefreshToken');
    });

    test('happy path', async () => {
      const response = await session
        .post('/auth/refresh')
        .send({ refreshToken });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ accessToken: expect.any(String) });
      expect(tokenService.newAccessToken).toHaveBeenCalledWith(user.id);
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
