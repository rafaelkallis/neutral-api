import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { UserRepository, USER_REPOSITORY } from 'user/domain/UserRepository';
import { ModelFaker, PrimitiveFaker } from 'test';
import { TokenService, TOKEN_SERVICE } from 'token';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/domain/ProjectRepository';
import { Project } from 'project/domain/Project';
import { Role } from 'project/domain/Role';
import { User } from 'user/domain/User';

describe('roles (e2e)', () => {
  let app: INestApplication;
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let tokenService: TokenService;
  let user: User;
  let project: Project;
  let role: Role;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    primitiveFaker = new PrimitiveFaker();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(USER_REPOSITORY);
    projectRepository = module.get(PROJECT_REPOSITORY);
    app = module.createNestApplication();
    await app.init();

    user = modelFaker.user();
    await userRepository.persist(user);
    project = modelFaker.project(user.id);
    role = modelFaker.role(project.id);
    project.roles.add(role);
    await projectRepository.persist(project);
    session = request.agent(app.getHttpServer());
    tokenService = module.get(TOKEN_SERVICE);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/roles (GET)', () => {
    test('happy path', async () => {
      const response = await session
        .get('/roles')
        .query({ projectId: project.id.value });
      expect(response.status).toBe(200);
      expect(response.body).toContainEqual({
        id: role.id.value,
        projectId: project.id.value,
        assigneeId: null,
        title: role.title.value,
        description: role.description.value,
        contribution: null,
        submittedPeerReviews: null,
        hasSubmittedPeerReviews: false,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });
  });

  describe('/roles/:id (GET)', () => {
    test('happy path', async () => {
      const response = await session.get(`/roles/${role.id.value}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: role.id.value,
        projectId: project.id.value,
        assigneeId: null,
        title: role.title.value,
        description: role.description.value,
        contribution: null,
        submittedPeerReviews: [],
        hasSubmittedPeerReviews: false,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });
  });

  describe('/roles (POST)', () => {
    let title: string;
    let description: string;

    beforeEach(() => {
      title = primitiveFaker.words();
      description = primitiveFaker.paragraph();
    });

    test('happy path', async () => {
      const response = await session.post('/roles').send({
        projectId: project.id.value,
        title,
        description,
      });
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        projectId: project.id.value,
        assigneeId: null,
        title,
        description,
        contribution: null,
        submittedPeerReviews: null,
        hasSubmittedPeerReviews: false,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      const response = await session.post('/roles').send({
        projectId: project.id.value,
        title,
        description,
      });
      expect(response.status).toBe(400);
    });
  });

  describe('/roles/:id (PATCH)', () => {
    let title: string;

    beforeEach(async () => {
      title = primitiveFaker.words();
    });

    test('happy path', async () => {
      const response = await session
        .patch(`/roles/${role.id.value}`)
        .send({ title });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ title }));
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      const response = await session
        .patch(`/roles/${role.id.value}`)
        .send({ title });
      expect(response.status).toBe(400);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = modelFaker.user();
      await userRepository.persist(otherUser);
      project.creatorId = otherUser.id;
      await projectRepository.persist(project);
      const response = await session
        .patch(`/roles/${role.id.value}`)
        .send({ title });
      expect(response.status).toBe(403);
    });

    test('should fail is project owner is assigned', async () => {
      const response = await session
        .patch(`/roles/${role.id.value}`)
        .send({ assigneeId: project.creatorId });
      expect(response.status).toBe(400);
    });
  });

  describe('/roles/:id (DELETE)', () => {
    test('happy path', async () => {
      const response = await session.del(`/roles/${role.id.value}`);
      expect(response.status).toBe(204);
      const updatedProject = await projectRepository.findById(project.id);
      expect(
        updatedProject.roles
          .toArray()
          .some(existingRole => existingRole.equals(role)),
      ).toBeFalsy();
    });
  });
});
