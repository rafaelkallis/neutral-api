import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module';
import {
  ProjectEntity,
  ProjectState,
  ProjectRepository,
  RoleRepository,
  TokenService,
  UserEntity,
  UserRepository,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';
import { ProjectDtoBuilder } from './dto/project.dto';

describe('ProjectController (e2e)', () => {
  let app: INestApplication;
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
    app = module.createNestApplication();
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
      const projectDto = new ProjectDtoBuilder(project).build();
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
      project.contributions = {
        [primitiveFaker.id()]: 0.1,
        [primitiveFaker.id()]: 0.3,
        [primitiveFaker.id()]: 0.2,
        [primitiveFaker.id()]: 0.4,
      };
      project.teamSpirit = 0.8;
      await projectRepository.save(project);
    });

    test('happy path', async () => {
      const response = await session.get(`/projects/${project.id}`);
      expect(response.status).toBe(200);
    });

    test('should have contributions if user is owner', async () => {
      const response = await session.get(`/projects/${project.id}`);
      expect(response.status).toBe(200);
      expect(response.body.contributions).toBeTruthy();
    });

    test('should have team spirit if user is owner', async () => {
      const response = await session.get(`/projects/${project.id}`);
      expect(response.status).toBe(200);
      expect(response.body.teamSpirit).toBeTruthy();
    });

    test('should not have contributions if user is not owner', async () => {
      const otherUser = await userRepository.save(entityFaker.user());
      const loginToken = tokenService.newLoginToken(
        otherUser.id,
        otherUser.lastLoginAt,
      );
      await session.post(`/auth/login/${loginToken}`);
      const response = await session.get(`/projects/${project.id}`);
      expect(response.status).toBe(200);
      expect(response.body.contributions).toBeFalsy();
    });

    test('should not have team spirit if user is not owner', async () => {
      const otherUser = await userRepository.save(entityFaker.user());
      const loginToken = tokenService.newLoginToken(
        otherUser.id,
        otherUser.lastLoginAt,
      );
      await session.post(`/auth/login/${loginToken}`);
      const response = await session.get(`/projects/${project.id}`);
      expect(response.status).toBe(200);
      expect(response.body.teamSpirit).toBeFalsy();
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
      expect(response.body).toBeDefined();
    });

    test('state change to peer-review state with unassigned role should fail', async () => {
      project.state = ProjectState.FORMATION;
      await projectRepository.save(project);
      const role = entityFaker.role(project.id);
      await roleRepository.save(role);
      const response = await session
        .patch(`/projects/${project.id}`)
        .send({ state: ProjectState.PEER_REVIEW });
      expect(response.status).toBe(400);
    });

    test('state change to finish state with pending peer review should fail', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.save(project);
      const role = entityFaker.role(project.id, user.id);
      role.peerReviews = null;
      await roleRepository.save(role);
      const response = await session
        .patch(`/projects/${project.id}`)
        .send({ state: ProjectState.FINISHED });
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
