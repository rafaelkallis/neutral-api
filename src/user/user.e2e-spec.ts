import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module';
import { TokenService, UserEntity, UserRepository } from '../common';
import { entityFaker } from '../test';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let user: UserEntity;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userRepository = module.get(UserRepository);
    user = await userRepository.save(entityFaker.user());

    app = module.createNestApplication();
    await app.init();

    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TokenService);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  test('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('/users (GET)', () => {
    test('happy path', async () => {
      const user = await userRepository.save(entityFaker.user());
      await userRepository.save(entityFaker.user());
      await userRepository.save(entityFaker.user());
      const response = await session.get('/users').query({ after: user.id });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).not.toContainEqual(user);
      for (const responseUser of response.body) {
        expect(responseUser.id > user.id).toBeTruthy();
      }
    });
  });

  describe('/users/me (GET)', () => {
    test('happy path', async () => {
      const response = await session.get('/users/me');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.lastLoginAt).toBeFalsy();
    });
  });

  describe('/users/:id (GET)', () => {
    test('happy path', async () => {
      const response = await session.get(`/users/${user.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe('/users/me (DELETE)', () => {
    test('happy path', async () => {
      const response = await session.delete('/users/me');
      expect(response.status).toBe(204);
      expect(response.body).toBeDefined();
      await expect(userRepository.count({ id: user.id })).resolves.toBe(0);
    });
  });
});
