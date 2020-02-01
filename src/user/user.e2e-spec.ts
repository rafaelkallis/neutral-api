import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import {
  UserRepository,
  USER_REPOSITORY,
} from './repositories/user.repository';
import { EntityFaker } from 'test';
import { UserDto } from './dto/user.dto';
import { TOKEN_SERVICE } from 'token';
import { UserModel } from 'user/user.model';

describe('user (e2e)', () => {
  let app: INestApplication;
  let entityFaker: EntityFaker;
  let userRepository: UserRepository;
  let user: UserModel;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    userRepository = module.get(USER_REPOSITORY);
    user = entityFaker.user();
    await userRepository.persist(user);

    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TOKEN_SERVICE);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    test('happy path', async () => {
      const response = await session.get('/users').query({ after: user.id });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      const userDto = UserDto.builder()
        .user(user)
        .authUser(user)
        .build();
      expect(response.body).not.toContainEqual(userDto);
      for (const responseUser of response.body) {
        expect(responseUser.id > user.id).toBeTruthy();
      }
    });

    test('happy path, text search', async () => {
      const user1 = entityFaker.user();
      user1.firstName = 'Anna';
      user1.lastName = 'Smith';
      const user2 = entityFaker.user();
      user2.firstName = 'Hannah';
      user2.lastName = 'Fitzgerald';
      const user3 = entityFaker.user();
      user3.firstName = 'Nanna';
      user3.lastName = 'Thompson';
      await userRepository.persist(user1, user2, user3);
      const response = await session.get('/users').query({ q: 'ann' });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      for (const queryUser of [user1, user2, user3]) {
        expect(response.body).toContainEqual({
          id: queryUser.id,
          email: null,
          firstName: queryUser.firstName,
          lastName: queryUser.lastName,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        });
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
      await expect(userRepository.exists(user.id)).resolves.toBeFalsy();
    });
  });
});
