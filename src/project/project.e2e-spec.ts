import { INestApplication } from '@nestjs/common';
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
      expect(response.body).not.toContainEqual(project);
      for (const responseProject of response.body) {
        expect(responseProject.id > project.id).toBeTruthy();
      }
    });
  });

  describe('/projects/:id (GET)', () => {
    let project: ProjectEntity;

    beforeEach(async () => {
      project = entityFaker.project(user.id);
      project.relativeContributions = {
        [primitiveFaker.id()]: 0.1,
        [primitiveFaker.id()]: 0.3,
        [primitiveFaker.id()]: 0.2,
        [primitiveFaker.id()]: 0.4,
      };
      await projectRepository.save(project);
    });

    test('happy path', async () => {
      const response = await session.get(`/projects/${project.id}`);
      expect(response.status).toBe(200);
    });

    test('should have relative contributions if user is owner', async () => {
      const response = await session.get(`/projects/${project.id}`);
      expect(response.status).toBe(200);
      expect(response.body.relativeContributions).toBeTruthy();
    });

    test('should not have relative contributions if user is not owner', async () => {
      const otherUser = await userRepository.save(entityFaker.user());
      const loginToken = tokenService.newLoginToken(
        otherUser.id,
        otherUser.lastLoginAt,
      );
      await session.post(`/auth/login/${loginToken}`);
      const response = await session.get(`/projects/${project.id}`);
      expect(response.status).toBe(200);
      expect(response.body.relativeContributions).toBeFalsy();
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

  describe('/projects/:id/relative-contributions (GET)', () => {
    let project: ProjectEntity;
    let role1: RoleEntity;
    let role2: RoleEntity;
    let role3: RoleEntity;
    let role4: RoleEntity;

    beforeEach(async () => {
      project = await projectRepository.save(entityFaker.project(user.id));
      role1 = entityFaker.role(project.id);
      role2 = entityFaker.role(project.id);
      role3 = entityFaker.role(project.id);
      role4 = entityFaker.role(project.id);
      role1.peerReviews = {
        [role1.id]: 0,
        [role2.id]: 20 / 90,
        [role3.id]: 30 / 90,
        [role4.id]: 40 / 90,
      };
      role2.peerReviews = {
        [role1.id]: 10 / 80,
        [role2.id]: 0,
        [role3.id]: 30 / 80,
        [role4.id]: 40 / 80,
      };
      role3.peerReviews = {
        [role1.id]: 10 / 70,
        [role2.id]: 20 / 70,
        [role3.id]: 0,
        [role4.id]: 40 / 70,
      };
      role4.peerReviews = {
        [role1.id]: 10 / 60,
        [role2.id]: 20 / 60,
        [role3.id]: 30 / 60,
        [role4.id]: 0,
      };
      await roleRepository.save(role1);
      await roleRepository.save(role2);
      await roleRepository.save(role3);
      await roleRepository.save(role4);
    });

    test('happy path', async () => {
      const response = await session.get(
        `/projects/${project.id}/relative-contributions`,
      );
      expect(response.status).toBe(200);
      expect(response.body[role1.id]).toBeCloseTo(0.1);
      expect(response.body[role2.id]).toBeCloseTo(0.2);
      expect(response.body[role3.id]).toBeCloseTo(0.3);
      expect(response.body[role4.id]).toBeCloseTo(0.4);
    });
  });
});
