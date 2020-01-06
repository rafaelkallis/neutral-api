import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { UserEntity } from './entities/user.entity';
import {
  UserRepository,
  USER_REPOSITORY,
} from './repositories/user.repository';
import { EntityFaker } from 'test';
import { TestModule } from 'test/test.module';
import { UserDto } from './dto/user.dto';
import { TypeOrmUserRepository } from 'user/repositories/typeorm-user.repository';
import { MockUserEntity } from 'user/entities/mock-user.entity';
import { TOKEN_SERVICE } from 'token';

describe('UserController (e2e)', () => {
  let entityFaker: EntityFaker;
  let userRepository: UserRepository;
  let user: UserEntity;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    })
      .overrideProvider(USER_REPOSITORY)
      .useClass(MockUserEntity)
      .compile();

    entityFaker = module.get(EntityFaker);
    userRepository = module.get(TypeOrmUserRepository);
    user = entityFaker.user();
    await user.persist();

    const app = module.createNestApplication();
    await app.init();

    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TOKEN_SERVICE);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
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
      await user1.persist();
      const user2 = entityFaker.user();
      user2.firstName = 'Hannah';
      user2.lastName = 'Fitzgerald';
      await user2.persist();
      const user3 = entityFaker.user();
      user3.firstName = 'Nanna';
      user3.lastName = 'Thompson';
      await user3.persist();
      const response = await session.get('/users').query({ q: 'ann' });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      const user1Dto = UserDto.builder()
        .user(user1)
        .authUser(user)
        .build();
      expect(response.body).toContainEqual(user1Dto);
      const user2Dto = UserDto.builder()
        .user(user2)
        .authUser(user)
        .build();
      expect(response.body).toContainEqual(user2Dto);
      const user3Dto = UserDto.builder()
        .user(user3)
        .authUser(user)
        .build();
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
      await expect(userRepository.exists(user.id)).resolves.toBeFalsy();
    });
  });
});
