import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { UserRepository, USER_REPOSITORY } from 'user/domain/UserRepository';
import { Project } from 'project/domain/Project';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/domain/ProjectRepository';
import { ModelFaker, PrimitiveFaker } from 'test';
import { TokenService, TOKEN_SERVICE } from 'token';
import { INestApplication } from '@nestjs/common';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { User } from 'user/domain/User';

describe('project (e2e)', () => {
  let app: INestApplication;
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let tokenService: TokenService;
  let user: User;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    primitiveFaker = new PrimitiveFaker();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(USER_REPOSITORY);
    projectRepository = module.get(PROJECT_REPOSITORY);
    app = module.createNestApplication();
    await app.init();
    user = modelFaker.user();
    await userRepository.persist(user);
    session = request.agent(app.getHttpServer());
    tokenService = module.get(TOKEN_SERVICE);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/projects (GET)', () => {
    test('happy path', async () => {
      const projects = [
        modelFaker.project(user.id),
        modelFaker.project(user.id),
        modelFaker.project(user.id),
      ];
      await projectRepository.persist(...projects);
      const response = await session
        .get('/projects')
        .query({ type: 'created' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      for (const project of projects) {
        expect(response.body).toContainEqual(
          expect.objectContaining({
            id: project.id.value,
          }),
        );
      }
    });
  });

  describe('/projects/:id (GET)', () => {
    let project: Project;

    beforeEach(async () => {
      project = modelFaker.project(user.id);
      project.consensuality = Consensuality.from(0.8);
      await projectRepository.persist(project);
    });

    test('happy path', async () => {
      // const response = await session.get(`/projects/${project.id.value}`);
      // expect(response.status).toBe(200);
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
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title,
          description,
        }),
      );
      await projectRepository.findById(response.body.id);
    });
  });

  describe('/projects/:id (PATCH)', () => {
    let project: Project;
    let title: string;

    beforeEach(async () => {
      project = modelFaker.project(user.id);
      await projectRepository.persist(project);
      title = primitiveFaker.words();
    });

    test('happy path', async () => {
      const response = await session
        .patch(`/projects/${project.id.value}`)
        .send({ title });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ title }));
      const updatedProject = await projectRepository.findById(project.id);
      expect(updatedProject.title.value).toEqual(title);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = modelFaker.user();
      await userRepository.persist(otherUser);
      project.creatorId = otherUser.id;
      await projectRepository.persist(project);
      const response = await session
        .patch(`/projects/${project.id.value}`)
        .send({ title });
      expect(response.status).toBe(403);
    });

    test('should fail if not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      const response = await session
        .patch(`/projects/${project.id.value}`)
        .send({ title });
      expect(response.status).toBe(400);
    });
  });

  describe('/projects/:id/finish-formation (POST)', () => {
    let project: Project;

    beforeEach(async () => {
      project = modelFaker.project(user.id);
      project.state = ProjectState.FORMATION;
      project.roles.add(
        modelFaker.role(project.id, user.id),
        modelFaker.role(project.id, user.id),
        modelFaker.role(project.id, user.id),
        modelFaker.role(project.id, user.id),
      );
      await projectRepository.persist(project);
    });

    test('happy path', async () => {
      const response = await session.post(
        `/projects/${project.id.value}/finish-formation`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      const updatedProject = await projectRepository.findById(project.id);
      expect(updatedProject.state).toEqual(ProjectState.PEER_REVIEW);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = modelFaker.user();
      await userRepository.persist(otherUser);
      project.creatorId = otherUser.id;
      await projectRepository.persist(project);
      const response = await session.post(
        `/projects/${project.id.value}/finish-formation`,
      );
      expect(response.status).toBe(403);
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      const response = await session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(400);
    });

    test('should fail if a role has no user assigned', async () => {
      project.roles.toArray()[1].assigneeId = null;
      await projectRepository.persist(project);
      const response = await session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(400);
    });
  });

  describe('/projects/:id (DELETE)', () => {
    let project: Project;

    beforeEach(async () => {
      project = modelFaker.project(user.id);
      await projectRepository.persist(project);
    });

    test('happy path', async () => {
      const response = await session.delete(`/projects/${project.id.value}`);
      expect(response.status).toBe(204);
      expect(response.body).toBeDefined();
      await expect(projectRepository.exists(project.id)).resolves.toBeFalsy();
    });
  });
});
