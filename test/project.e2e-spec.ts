import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  User,
  Project,
  UserRepository,
  ProjectRepository,
  EmailService,
  TokenService,
  SessionMiddleware,
} from '../src/common';
import { entityFaker, primitiveFaker } from '../src/test';

describe('ProjectController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let user: User;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(UserRepository);
    projectRepository = module.get(ProjectRepository);
    user = await userRepository.save(entityFaker.user());
    app = module.createNestApplication();
    await app.init();
    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TokenService);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  describe('/projects (GET)', () => {
    let projects: Project[];

    beforeEach(async () => {
      projects = [
        await projectRepository.save(entityFaker.project(user.id)),
        await projectRepository.save(entityFaker.project(user.id)),
        await projectRepository.save(entityFaker.project(user.id)),
      ];
    });

    test('happy path', async () => {
      const response = await session.get('/projects');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe('/projects/:id (GET)', () => {
    let project: Project;

    beforeEach(async () => {
      project = await projectRepository.save(entityFaker.project(user.id));
    });

    test('happy path', async () => {
      const response = await session.get(`/projects/${project.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe('/projects (POST)', () => {
    let title: string;
    let description: string;

    beforeEach(() => {
      title = primitiveFaker.words();
      description = primitiveFaker.paragraph();
    });

    test('happy path', async () => {
      const response = await session.post('/projects').send({
        title,
        description,
      });
      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
    });
  });

  describe.skip('/projects/:id (PATCH)', () => {
    let project: Project;
    let newTitle: string;

    beforeEach(async () => {
      project = await projectRepository.save(entityFaker.project(user.id));
      newTitle = primitiveFaker.words();
    });

    test('happy path', async () => {
      const response = await session
        .patch(`/projects/${project.id}`)
        .send({ title: newTitle });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe.skip('/projects/:id (DELETE)', () => {
    let project: Project;

    beforeEach(async () => {
      project = await projectRepository.save(entityFaker.project(user.id));
    });

    test('happy path', async () => {
      const response = await session.delete(`/projects/${project.id}`);
      expect(response.status).toBe(204);
      expect(response.body).toBeDefined();
    });
  });
});
