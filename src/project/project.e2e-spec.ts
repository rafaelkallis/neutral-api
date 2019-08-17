import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module';
import {
  Project,
  ProjectRepository,
  Role,
  RoleRepository,
  TokenService,
  User,
  UserRepository,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';

describe('ProjectController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let user: User;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(UserRepository);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    user = await userRepository.save(entityFaker.user());
    app = module.createNestApplication();
    await app.init();
    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TokenService);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  describe('/projects (GET)', () => {
    let project: Project;

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      await projectRepository.save(project);
    });

    test('happy path', async () => {
      const response = await session.get('/projects');
      expect(response.status).toBe(200);
      expect(response.body).toContainEqual(project);
    });
  });

  describe('/projects/:id (GET)', () => {
    let project: Project;

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      await projectRepository.save(project);
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

  describe('/projects/:id (PATCH)', () => {
    let project: Project;
    let newTitle: string;

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      await projectRepository.save(project);
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

  describe('/projects/:id (DELETE)', () => {
    let project: Project;

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      await projectRepository.save(project);
    });

    test('happy path', async () => {
      const response = await session.delete(`/projects/${project.id}`);
      expect(response.status).toBe(204);
      expect(response.body).toBeDefined();
      await expect(projectRepository.count({ id: project.id })).resolves.toBe(
        0,
      );
    });
  });

  describe('/projects/:id/relative-contributions (GET)', () => {
    let project: Project;
    let role1: Role;
    let role2: Role;
    let role3: Role;
    let role4: Role;

    beforeEach(async () => {
      project = await projectRepository.save(entityFaker.project(user.id));
      role1 = entityFaker.role(project.id);
      role2 = entityFaker.role(project.id);
      role3 = entityFaker.role(project.id);
      role4 = entityFaker.role(project.id);
      role1.peerReviews = {
        [role1.id]: 0,
        [role2.id]: 20 / 90,
        [role3.id]: 30 / 90,
        [role4.id]: 40 / 90,
      };
      role2.peerReviews = {
        [role1.id]: 10 / 80,
        [role2.id]: 0,
        [role3.id]: 30 / 80,
        [role4.id]: 40 / 80,
      };
      role3.peerReviews = {
        [role1.id]: 10 / 70,
        [role2.id]: 20 / 70,
        [role3.id]: 0,
        [role4.id]: 40 / 70,
      };
      role4.peerReviews = {
        [role1.id]: 10 / 60,
        [role2.id]: 20 / 60,
        [role3.id]: 30 / 60,
        [role4.id]: 0,
      };
      await roleRepository.save(role1);
      await roleRepository.save(role2);
      await roleRepository.save(role3);
      await roleRepository.save(role4);
    });

    test('happy path', async () => {
      const response = await session.get(
        `/projects/${project.id}/relative-contributions`,
      );
      expect(response.status).toBe(200);
      expect(response.body[role1.id]).toBeCloseTo(0.1);
      expect(response.body[role2.id]).toBeCloseTo(0.2);
      expect(response.body[role3.id]).toBeCloseTo(0.3);
      expect(response.body[role4.id]).toBeCloseTo(0.4);
    });
  });
});
