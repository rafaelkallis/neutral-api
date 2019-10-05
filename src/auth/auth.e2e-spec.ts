import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module';
import {
  EmailService,
  TokenService,
  UserEntity,
  UserRepository,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let emailService: EmailService;
  let tokenService: TokenService;
  let user: UserEntity;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userRepository = module.get(UserRepository);
    user = await userRepository.save(entityFaker.user());
    emailService = module.get(EmailService);
    tokenService = module.get(TokenService);

    app = module.createNestApplication();
    await app.init();

    session = request.agent(app.getHttpServer());
  });

  test('should be defined', () => {
    expect(app).toBeDefined();
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
      });
      expect(tokenService.newAccessToken).toHaveBeenCalledWith(user.id);
      expect(tokenService.newRefreshToken).toHaveBeenCalledWith(user.id);
      const updatedUser = await userRepository.findOneOrFail({ id: user.id });
      expect(user.lastLoginAt).toBeLessThan(updatedUser.lastLoginAt);
    });
  });

  describe('/auth/signup (POST)', () => {
    let email: string;

    beforeEach(() => {
      email = primitiveFaker.email();
      jest.spyOn(tokenService, 'newSignupToken');
      jest.spyOn(emailService, 'sendSignupEmail').mockResolvedValue();
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
      jest.spyOn(userRepository, 'save');
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
      });
      expect(tokenService.newAccessToken).toHaveBeenCalled();
      expect(tokenService.newRefreshToken).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
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
});
