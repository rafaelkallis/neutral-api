import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { UserEntity } from 'user';
import { ProjectEntity } from 'project/entities/project.entity';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/repositories/project.repository';
import { RoleRepository, ROLE_REPOSITORY, RoleEntity } from 'role';
import { EntityFaker, PrimitiveFaker, TestUtils } from 'test';
import { TestModule } from 'test/test.module';
import { ProjectDto } from './dto/project.dto';
import { ProjectState } from 'project';
import { TokenService, TOKEN_SERVICE } from 'token';

describe('ProjectController (e2e)', () => {
  let testUtils: TestUtils;
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let tokenService: TokenService;
  let user: UserEntity;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();
    testUtils = module.get(TestUtils);
    entityFaker = module.get(EntityFaker);
    primitiveFaker = module.get(PrimitiveFaker);
    projectRepository = module.get(PROJECT_REPOSITORY);
    roleRepository = module.get(ROLE_REPOSITORY);
    user = entityFaker.user();
    await user.persist();
    const app = module.createNestApplication();
    await app.init();
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
      for (const project of projects) {
        await project.persist();
      }
      const response = await session
        .get('/projects')
        .query({ after: projects[0].id });
      expect(response.status).toBe(200);
      const projectDto = ProjectDto.builder()
        .project(projects[0])
        .authUser(user)
        .build();
      expect(response.body).not.toContainEqual(projectDto);
      for (const responseProject of response.body) {
        expect(responseProject.id > projects[0].id).toBeTruthy();
      }
    });
  });

  describe('/projects/:id (GET)', () => {
    let project: ProjectEntity;

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      project.consensuality = 0.8;
      await project.persist();
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
      await testUtils.sleep(500);
      await projectRepository.findOne(response.body.id);
    });
  });

  describe('/projects/:id (PATCH)', () => {
    let project: ProjectEntity;
    let title: string;

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      await project.persist();
      title = primitiveFaker.words();
    });

    test('happy path', async () => {
      const response = await session
        .patch(`/projects/${project.id}`)
        .send({ title });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ title }));
      await testUtils.sleep(500);
      const updatedProject = await projectRepository.findOne(project.id);
      expect(updatedProject.title).toEqual(title);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = entityFaker.user();
      await otherUser.persist();
      project.ownerId = otherUser.id;
      await project.persist();
      const response = await session
        .patch(`/projects/${project.id}`)
        .send({ title });
      expect(response.status).toBe(403);
    });

    test('should fail if not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await project.persist();
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
      await project.persist();
      roles = [
        entityFaker.role(project.id, user.id),
        entityFaker.role(project.id, user.id),
        entityFaker.role(project.id, user.id),
        entityFaker.role(project.id, user.id),
      ];
      for (const role of roles) {
        await role.persist();
      }
    });

    test('happy path', async () => {
      const response = await session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      await testUtils.sleep(500);
      const updatedProject = await projectRepository.findOne(project.id);
      expect(updatedProject.state).toEqual(ProjectState.PEER_REVIEW);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = entityFaker.user();
      await otherUser.persist();
      project.ownerId = otherUser.id;
      await project.persist();
      const response = await session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(403);
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await project.persist();
      const response = await session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(400);
    });

    test('should fail if a role has no user assigned', async () => {
      roles[1].assigneeId = null;
      await roles[1].persist();
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
      await project.persist();
    });

    test('happy path', async () => {
      const response = await session.delete(`/projects/${project.id}`);
      expect(response.status).toBe(204);
      expect(response.body).toBeDefined();
      await testUtils.sleep(500);
      await expect(projectRepository.exists(project.id)).resolves.toBeFalsy();
    });
  });
});
