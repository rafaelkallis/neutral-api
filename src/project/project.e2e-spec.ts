import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module';
import { TokenService } from '../common';
import { UserEntity, UserRepository } from '../user';
import { ProjectEntity, ProjectState } from './entities/project.entity';
import { ProjectRepository } from './repositories/project.repository';
import { RoleEntity, RoleRepository } from '../role';
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
    user = entityFaker.user();
    await userRepository.insert(user);
    const app = module.createNestApplication();
    await app.init();
    session = request.agent(app.getHttpServer());
    tokenService = module.get(TokenService);
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
        await projectRepository.insert(project);
      }
      const response = await session
        .get('/projects')
        .query({ after: projects[0].id });
      expect(response.status).toBe(200);
      const projectDto = ProjectDtoBuilder.of(projects[0])
        .withAuthUser(user)
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
      await projectRepository.insert(project);
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
      await projectRepository.insert(project);
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
      await userRepository.insert(otherUser);
      project.ownerId = otherUser.id;
      await projectRepository.update(project);
      const response = await session
        .patch(`/projects/${project.id}`)
        .send({ title });
      expect(response.status).toBe(403);
    });

    test('should fail if not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.update(project);
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
      await projectRepository.insert(project);
      roles = [
        entityFaker.role(project.id, user.id),
        entityFaker.role(project.id, user.id),
        entityFaker.role(project.id, user.id),
        entityFaker.role(project.id, user.id),
      ];
      for (const role of roles) {
        await roleRepository.insert(role);
      }
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
      await userRepository.insert(otherUser);
      project.ownerId = otherUser.id;
      await projectRepository.update(project);
      const response = await session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(403);
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.update(project);
      const response = await session.post(
        `/projects/${project.id}/finish-formation`,
      );
      expect(response.status).toBe(400);
    });

    test('should fail if a role has no user assigned', async () => {
      roles[1].assigneeId = null;
      await roleRepository.update(roles[1]);
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
      await projectRepository.insert(project);
    });

    test('happy path', async () => {
      const response = await session.delete(`/projects/${project.id}`);
      expect(response.status).toBe(204);
      expect(response.body).toBeDefined();
      await expect(
        projectRepository.exists({ id: project.id }),
      ).resolves.toBeFalsy();
    });
  });
});
