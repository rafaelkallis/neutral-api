import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { UserEntity, UserRepository, USER_REPOSITORY } from 'user';
import {
  ProjectEntity,
  ProjectState,
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project';
import { RoleEntity, RoleRepository } from 'role';
import { EntityFaker, PrimitiveFaker } from 'test';
import { TokenService, TOKEN_SERVICE } from 'token';
import { ROLE_REPOSITORY } from 'role/repositories/role.repository';

describe('roles (e2e)', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let tokenService: TokenService;
  let user: UserEntity;
  let project: ProjectEntity;
  let role: RoleEntity;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    primitiveFaker = new PrimitiveFaker();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(USER_REPOSITORY);
    projectRepository = module.get(PROJECT_REPOSITORY);
    roleRepository = module.get(ROLE_REPOSITORY);
    const app = module.createNestApplication();
    await app.init();

    user = entityFaker.user();
    await userRepository.persist(user);
    project = entityFaker.project(user.id);
    await projectRepository.persist(project);
    role = entityFaker.role(project.id);
    await roleRepository.persist(role);
    session = request.agent(app.getHttpServer());
    tokenService = module.get(TOKEN_SERVICE);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
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
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
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
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
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
      const otherUser = entityFaker.user();
      await userRepository.persist(otherUser);
      project.ownerId = otherUser.id;
      await projectRepository.persist(project);
      const response = await session.patch(`/roles/${role.id}`).send({ title });
      expect(response.status).toBe(403);
    });

    test('should fail is project owner is assigned', async () => {
      const response = await session
        .patch(`/roles/${role.id}`)
        .send({ assigneeId: project.ownerId });
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
