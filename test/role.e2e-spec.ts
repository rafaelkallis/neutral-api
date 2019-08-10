import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import {
  Project,
  ProjectRepository,
  TokenService,
  User,
  UserRepository,
} from '../src/common';
import { entityFaker } from '../src/test';

describe('RoleController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let user: User;
  let project: Project;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(UserRepository);
    projectRepository = module.get(ProjectRepository);
    // roleRepository = module.get(RoleRepository);
    user = entityFaker.user();
    await userRepository.save(user);
    project = entityFaker.project(user.id);
    await projectRepository.save(project);
    app = module.createNestApplication();
    await app.init();
    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TokenService);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  describe('/roles (GET)', () => {
    test.todo('happy path');
  });

  describe('/roles/:id (GET)', () => {
    test.todo('happy path');
  });

  describe('/roles (POST)', () => {
    test.todo('happy path');
  });

  describe('/roles/:id (PATCH)', () => {
    test.todo('happy path');
  });

  describe('/roles/:id (DELETE)', () => {
    test.todo('happy path');
  });
});
