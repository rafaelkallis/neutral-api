import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module';
import { TokenService } from '../common';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { entityFaker } from '../test';
import { UserDtoBuilder } from './dto/user.dto';

describe('UserController (e2e)', () => {
  let userRepository: UserRepository;
  let user: UserEntity;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userRepository = module.get(UserRepository);
    user = entityFaker.user();
    await userRepository.insert(user);

    const app = module.createNestApplication();
    await app.init();

    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TokenService);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  describe('/users (GET)', () => {
    test('happy path', async () => {
      const response = await session.get('/users').query({ after: user.id });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      const userDto = new UserDtoBuilder(user, user).build();
      expect(response.body).not.toContainEqual(userDto);
      for (const responseUser of response.body) {
        expect(responseUser.id > user.id).toBeTruthy();
      }
    });

    test('happy path, text search', async () => {
      let user1 = entityFaker.user();
      user1.firstName = 'Anna';
      user1.lastName = 'Smith';
      await userRepository.insert(user1);
      let user2 = entityFaker.user();
      user2.firstName = 'Hannah';
      user2.lastName = 'Fitzgerald';
      await userRepository.insert(user2);
      let user3 = entityFaker.user();
      user3.firstName = 'Nanna';
      user3.lastName = 'Thompson';
      await userRepository.insert(user3);
      const response = await session.get('/users').query({ q: 'ann' });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      const user1Dto = new UserDtoBuilder(user1, user).build();
      expect(response.body).toContainEqual(user1Dto);
      const user2Dto = new UserDtoBuilder(user2, user).build();
      expect(response.body).toContainEqual(user2Dto);
      const user3Dto = new UserDtoBuilder(user3, user).build();
      expect(response.body).toContainEqual(user3Dto);
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
      await expect(userRepository.exists({ id: user.id })).resolves.toBeFalsy();
    });
  });
});
