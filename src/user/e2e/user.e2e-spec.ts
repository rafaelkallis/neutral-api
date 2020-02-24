import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app/AppModule';
import { UserRepository, USER_REPOSITORY } from 'user/domain/UserRepository';
import { UserDto } from 'user/application/dto/UserDto';
import { TOKEN_MANAGER } from 'token/application/TokenManager';
import { User } from 'user/domain/User';
import { ModelFaker } from 'test';
import { Name } from 'user/domain/value-objects/Name';

describe('user (e2e)', () => {
  let app: INestApplication;
  let modelFaker: ModelFaker;
  let userRepository: UserRepository;
  let user: User;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    userRepository = module.get(USER_REPOSITORY);
    user = modelFaker.user();
    await userRepository.persist(user);

    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TOKEN_MANAGER);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    test('happy path', async () => {
      const response = await session
        .get('/users')
        .query({ after: user.id.value });
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
      const user1 = modelFaker.user();
      user1.name = Name.from('Anna', 'Smith');
      const user2 = modelFaker.user();
      user2.name = Name.from('Hannah', 'Fitzgerald');
      const user3 = modelFaker.user();
      user3.name = Name.from('Nanna', 'Thompson');
      await userRepository.persist(user1, user2, user3);
      const response = await session.get('/users').query({ q: 'ann' });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      for (const queryUser of [user1, user2, user3]) {
        expect(response.body).toContainEqual({
          id: queryUser.id.value,
          email: null,
          firstName: queryUser.name.first,
          lastName: queryUser.name.last,
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