import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module';
import { TokenService } from '../common';
import { UserEntity, UserRepository } from '../user';
import { ProjectEntity, ProjectState, ProjectRepository } from '../project';
import { RoleEntity, RoleRepository } from '../role';
import { entityFaker, primitiveFaker } from '../test';

describe('RoleController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let tokenService: TokenService;
  let user: UserEntity;
  let project: ProjectEntity;
  let role: RoleEntity;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(UserRepository);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    user = entityFaker.user();
    await userRepository.insert(user);
    project = entityFaker.project(user.id);
    await projectRepository.insert(project);
    role = entityFaker.role(project.id);
    await roleRepository.insert(role);
    app = module.createNestApplication();
    await app.init();
    session = request.agent(app.getHttpServer());
    tokenService = module.get(TokenService);
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
        sentPeerReviews: [],
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
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.update(project);
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
      await projectRepository.update(project);
      const response = await session.patch(`/roles/${role.id}`).send({ title });
      expect(response.status).toBe(400);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = entityFaker.user();
      await userRepository.update(otherUser);
      project.ownerId = otherUser.id;
      await projectRepository.update(project);
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
      expect(await roleRepository.exists({ id: role.id })).toBeFalsy();
    });
  });
});
