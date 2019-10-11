import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module';
import {
  ProjectEntity,
  ProjectRepository,
  ProjectState,
  TokenService,
  UserEntity,
  UserRepository,
  RoleEntity,
  RoleRepository,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';

describe('RoleController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
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
    await userRepository.save(user);
    project = entityFaker.project(user.id);
    await projectRepository.save(project);
    role = entityFaker.role(project.id);
    await roleRepository.save(role);
    app = module.createNestApplication();
    await app.init();
    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TokenService);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  describe('/roles (GET)', () => {
    test('happy path', async () => {
      const response = await session
        .get('/roles')
        .query({ projectId: project.id });
      expect(response.status).toBe(200);
      expect(response.body).toContainEqual(role);
    });
  });

  describe('/roles/:id (GET)', () => {
    test('happy path', async () => {
      const response = await session.get(`/roles/${role.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(role);
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
        peerReviews: null,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.save(project);
      const response = await session.post('/roles').send({
        projectId: project.id,
        title,
        description,
      });
      expect(response.status).toBe(400);
    });
  });

  describe('/roles/:id (PATCH)', () => {
    test.todo('happy path');
  });

  describe('/roles/:id (DELETE)', () => {
    test('happy path', async () => {
      const response = await session.del(`/roles/${role.id}`);
      expect(response.status).toBe(204);
      expect(await roleRepository.findOne({ id: role.id })).not.toBeDefined();
    });
  });

  describe('/roles/:id/submit-peer-reviews (POST)', () => {
    let role2: RoleEntity;
    let role3: RoleEntity;
    let role4: RoleEntity;
    let peerReviews: Record<string, number>;

    beforeEach(async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.save(project);
      role.assigneeId = user.id;
      role.peerReviews = null;
      await roleRepository.save(role);
      role2 = entityFaker.role(project.id);
      role3 = entityFaker.role(project.id);
      role4 = entityFaker.role(project.id);
      role2.peerReviews = {
        [role.id]: 0.8,
        [role2.id]: 0,
        [role3.id]: 0.1,
        [role4.id]: 0.1,
      };
      role3.peerReviews = {
        [role.id]: 0.8,
        [role2.id]: 0.1,
        [role3.id]: 0,
        [role4.id]: 0.1,
      };
      role4.peerReviews = {
        [role.id]: 0.8,
        [role2.id]: 0.1,
        [role3.id]: 0.1,
        [role4.id]: 0,
      };
      await roleRepository.save(role2);
      await roleRepository.save(role3);
      await roleRepository.save(role4);
      peerReviews = {
        [role.id]: 0,
        [role2.id]: 0.3,
        [role3.id]: 0.2,
        [role4.id]: 0.5,
      };
    });

    test('happy path, final peer review', async () => {
      const response = await session
        .post(`/roles/${role.id}/submit-peer-reviews`)
        .send({ peerReviews });
      expect(response.status).toBe(200);
      const updatedRole = await roleRepository.findOneOrFail({ id: role.id });
      expect(updatedRole.peerReviews).toEqual(peerReviews);
      const updatedProject = await projectRepository.findOneOrFail({
        id: project.id,
      });
      expect(updatedProject.state).toBe(ProjectState.FINISHED);
      expect(updatedProject.contributions).toBeTruthy();
    });

    test('happy path, not final peer review', async () => {
      role2.peerReviews = null;
      await roleRepository.save(role2);
      const response = await session
        .post(`/roles/${role.id}/submit-peer-reviews`)
        .send({ peerReviews });
      expect(response.status).toBe(200);
      const updatedRole = await roleRepository.findOneOrFail({ id: role.id });
      expect(updatedRole.peerReviews).toEqual(peerReviews);
      const updatedProject = await projectRepository.findOneOrFail({
        id: project.id,
      });
      expect(updatedProject.state).toBe(ProjectState.PEER_REVIEW);
      expect(updatedProject.contributions).toBeFalsy();
    });

    test('should fail if project is not in peer-review state', async () => {
      project.state = ProjectState.FORMATION;
      await projectRepository.save(project);
      const response = await session
        .post(`/roles/${role.id}/submit-peer-reviews`)
        .send({ peerReviews });
      expect(response.status).toBe(400);
    });

    test('should fail if peer-review already submitted', async () => {
      role.peerReviews = peerReviews;
      await roleRepository.save(role);
      const response = await session
        .post(`/roles/${role.id}/submit-peer-reviews`)
        .send({ peerReviews });
      expect(response.status).toBe(400);
    });

    test('should fail if a peer review is for non-existing peer', async () => {
      role.peerReviews = peerReviews;
      delete role.peerReviews[role2.id];
      role.peerReviews[primitiveFaker.id()] = 0.3;
      await roleRepository.save(role);
      const response = await session
        .post(`/roles/${role.id}/submit-peer-reviews`)
        .send({ peerReviews });
      expect(response.status).toBe(400);
    });
  });
});
