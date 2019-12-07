import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module';
import {
  ProjectEntity,
  ProjectState,
  ProjectRepository,
  RoleEntity,
  RoleRepository,
  TokenService,
  UserEntity,
  UserRepository,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';
import { ProjectDtoBuilder } from './dto/project.dto';

describe('ProjectController (e2e)', () => {
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let tokenService: TokenService;
  let user: UserEntity;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(UserRepository);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    user = await userRepository.save(entityFaker.user());
    const app = module.createNestApplication();
    await app.init();
    session = request.agent(app.getHttpServer());
    tokenService = module.get(TokenService);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  describe('/projects (GET)', () => {
    test('happy path', async () => {
      const project = await projectRepository.save(
        entityFaker.project(user.id),
      );
      await projectRepository.save(entityFaker.project(user.id));
      await projectRepository.save(entityFaker.project(user.id));
      const response = await session
        .get('/projects')
        .query({ after: project.id });
      expect(response.status).toBe(200);
      const projectDto = new ProjectDtoBuilder(project, user).build();
      expect(response.body).not.toContainEqual(projectDto);
      for (const responseProject of response.body) {
        expect(responseProject.id > project.id).toBeTruthy();
      }
    });
  });

  describe('/projects/:id (GET)', () => {
    let project: ProjectEntity;

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      project.consensuality = 0.8;
      await projectRepository.save(project);
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
      expect(response.body).toBeDefined();
    });
  });

  describe('/projects/:id (PATCH)', () => {
    let project: ProjectEntity;
    let title: string;

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      await projectRepository.save(project);
      title = primitiveFaker.words();
    });

    test('happy path', async () => {
      const response = await session
        .patch(`/projects/${project.id}`)
        .send({ title });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ title }));
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = entityFaker.user();
      await userRepository.save(otherUser);
      project.ownerId = otherUser.id;
      await projectRepository.save(project);
      const response = await session
        .patch(`/projects/${project.id}`)
        .send({ title });
      expect(response.status).toBe(403);
    });

    test('should fail if not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.save(project);
      const response = await session
        .patch(`/projects/${project.id}`)
        .send({ title });
      expect(response.status).toBe(400);
    });
  });

  describe('/projects/:id/finish-formation (POST)', () => {
    let project: ProjectEntity;
    let role1: RoleEntity;
    let role2: RoleEntity;
    let role3: RoleEntity;
    let role4: RoleEntity;

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      project.state = ProjectState.FORMATION;
      await projectRepository.save(project);
      role1 = entityFaker.role(project.id, user.id);
      role2 = entityFaker.role(project.id, user.id);
      role3 = entityFaker.role(project.id, user.id);
      role4 = entityFaker.role(project.id, user.id);
      await roleRepository.save(role1);
      await roleRepository.save(role2);
      await roleRepository.save(role3);
      await roleRepository.save(role4);
    });

    test('happy path', async () => {
      const response = await session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = entityFaker.user();
      await userRepository.save(otherUser);
      project.ownerId = otherUser.id;
      await projectRepository.save(project);
      const response = await session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(403);
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.save(project);
      const response = await session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(400);
    });

    test('should fail if a role has no user assigned', async () => {
      role2.assigneeId = null;
      await roleRepository.save(role2);
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
});
