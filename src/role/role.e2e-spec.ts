import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { UserModel, UserRepository, USER_REPOSITORY } from 'user';
import {
  ProjectModel,
  ProjectState,
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project';
import { RoleModel, RoleRepository } from 'role';
import { ModelFaker, PrimitiveFaker } from 'test';
import { TokenService, TOKEN_SERVICE } from 'token';
import { ROLE_REPOSITORY } from 'role/domain/RoleRepository';

describe('roles (e2e)', () => {
  let app: INestApplication;
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let tokenService: TokenService;
  let user: UserModel;
  let project: ProjectModel;
  let role: RoleModel;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    primitiveFaker = new PrimitiveFaker();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(USER_REPOSITORY);
    projectRepository = module.get(PROJECT_REPOSITORY);
    roleRepository = module.get(ROLE_REPOSITORY);
    app = module.createNestApplication();
    await app.init();

    user = modelFaker.user();
    await userRepository.persist(user);
    project = modelFaker.project(user.id);
    await projectRepository.persist(project);
    role = modelFaker.role(project.id);
    await roleRepository.persist(role);
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
        .query({ projectId: project.id });
      expect(response.status).toBe(200);
      expect(response.body).toContainEqual({
        id: role.id,
        projectId: role.projectId,
        assigneeId: role.assigneeId,
        title: role.title,
        description: role.description,
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
      const response = await session.get(`/roles/${role.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: role.id,
        projectId: role.projectId,
        assigneeId: role.assigneeId,
        title: role.title,
        description: role.description,
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
        projectId: project.id,
        title,
        description,
      });
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        projectId: project.id,
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
        projectId: project.id,
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
      const response = await session.patch(`/roles/${role.id}`).send({ title });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ title }));
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      const response = await session.patch(`/roles/${role.id}`).send({ title });
      expect(response.status).toBe(400);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = modelFaker.user();
      await userRepository.persist(otherUser);
      project.creatorId = otherUser.id;
      await projectRepository.persist(project);
      const response = await session.patch(`/roles/${role.id}`).send({ title });
      expect(response.status).toBe(403);
    });

    test('should fail is project owner is assigned', async () => {
      const response = await session
        .patch(`/roles/${role.id}`)
        .send({ assigneeId: project.creatorId });
      expect(response.status).toBe(400);
    });
  });

  describe('/roles/:id (DELETE)', () => {
    test('happy path', async () => {
      const response = await session.del(`/roles/${role.id}`);
      expect(response.status).toBe(204);
      expect(await roleRepository.exists(role.id)).toBeFalsy();
    });
  });
});
