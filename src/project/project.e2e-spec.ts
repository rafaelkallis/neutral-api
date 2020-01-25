import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { UserEntity, USER_REPOSITORY, UserRepository } from 'user';
import { ProjectEntity } from 'project/entities/project.entity';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/repositories/project.repository';
import { RoleRepository, ROLE_REPOSITORY, RoleEntity } from 'role';
import { EntityFaker, PrimitiveFaker, TestUtils } from 'test';
import { ProjectDto } from './dto/project.dto';
import { ProjectState } from 'project';
import { TokenService, TOKEN_SERVICE } from 'token';
import { INestApplication } from '@nestjs/common';

describe('ProjectController (e2e)', () => {
  let app: INestApplication;
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let tokenService: TokenService;
  let user: UserEntity;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    primitiveFaker = new PrimitiveFaker();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(USER_REPOSITORY);
    projectRepository = module.get(PROJECT_REPOSITORY);
    roleRepository = module.get(ROLE_REPOSITORY);
    app = module.createNestApplication();
    await app.init();
    user = entityFaker.user();
    await userRepository.persist(user);
    session = request.agent(app.getHttpServer());
    tokenService = module.get(TOKEN_SERVICE);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  describe('/projects (GET)', () => {
    test('happy path', async () => {
      const projects = [
        entityFaker.project(user.id),
        entityFaker.project(user.id),
        entityFaker.project(user.id),
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
            id: project.id,
          }),
        );
      }
    });
  });

  describe('/projects/:id (GET)', () => {
    let project: ProjectEntity;

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      project.consensuality = 0.8;
      await projectRepository.persist(project);
    });

    test('happy path', async () => {
      const response = await session.get(`/projects/${project.id}`);
      expect(response.status).toBe(200);
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
      await TestUtils.sleep(500);
      await projectRepository.findById(response.body.id);
    });
  });

  describe('/projects/:id (PATCH)', () => {
    let project: ProjectEntity;
    let title: string;

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      await projectRepository.persist(project);
      title = primitiveFaker.words();
    });

    test('happy path', async () => {
      const response = await session
        .patch(`/projects/${project.id}`)
        .send({ title });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ title }));
      await TestUtils.sleep(500);
      const updatedProject = await projectRepository.findById(project.id);
      expect(updatedProject.title).toEqual(title);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = entityFaker.user();
      await userRepository.persist(otherUser);
      project.creatorId = otherUser.id;
      await projectRepository.persist(project);
      const response = await session
        .patch(`/projects/${project.id}`)
        .send({ title });
      expect(response.status).toBe(403);
    });

    test('should fail if not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      const response = await session
        .patch(`/projects/${project.id}`)
        .send({ title });
      expect(response.status).toBe(400);
    });
  });

  describe('/projects/:id/finish-formation (POST)', () => {
    let project: ProjectEntity;
    let roles: RoleEntity[];

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      project.state = ProjectState.FORMATION;
      await projectRepository.persist(project);
      roles = [
        entityFaker.role(project.id, user.id),
        entityFaker.role(project.id, user.id),
        entityFaker.role(project.id, user.id),
        entityFaker.role(project.id, user.id),
      ];
      await roleRepository.persist(...roles);
    });

    test('happy path', async () => {
      const response = await session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      await TestUtils.sleep(500);
      const updatedProject = await projectRepository.findById(project.id);
      expect(updatedProject.state).toEqual(ProjectState.PEER_REVIEW);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = entityFaker.user();
      await userRepository.persist(otherUser);
      project.creatorId = otherUser.id;
      await projectRepository.persist(project);
      const response = await session.post(
        `/projects/${project.id}/finish-formation`,
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
      roles[1].assigneeId = null;
      await roleRepository.persist(roles[1]);
      const response = await session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(400);
    });
  });

  describe('/projects/:id (DELETE)', () => {
    let project: ProjectEntity;

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      await projectRepository.persist(project);
    });

    test('happy path', async () => {
      const response = await session.delete(`/projects/${project.id}`);
      expect(response.status).toBe(204);
      expect(response.body).toBeDefined();
      await TestUtils.sleep(500);
      await expect(projectRepository.exists(project.id)).resolves.toBeFalsy();
    });
  });
});
