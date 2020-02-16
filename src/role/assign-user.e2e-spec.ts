import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { UserModel, UserRepository, USER_REPOSITORY } from 'user';
import { RoleModel, RoleRepository } from 'role';
import { ModelFaker, PrimitiveFaker } from 'test';
import { TokenService, TOKEN_SERVICE } from 'token';
import { ROLE_REPOSITORY } from 'role/domain/RoleRepository';
import { EmailService, EMAIL_SERVICE } from 'email';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/domain/ProjectRepository';
import { ProjectModel } from 'project/domain/ProjectModel';

describe('assign user to role', () => {
  let app: INestApplication;
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let tokenService: TokenService;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let emailService: EmailService;
  let user: UserModel;
  let project: ProjectModel;
  let role: RoleModel;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    primitiveFaker = new PrimitiveFaker();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(USER_REPOSITORY);
    projectRepository = module.get(PROJECT_REPOSITORY);
    roleRepository = module.get(ROLE_REPOSITORY);
    tokenService = module.get(TOKEN_SERVICE);
    emailService = module.get(EMAIL_SERVICE);

    app = module.createNestApplication();
    await app.init();

    user = modelFaker.user();
    await userRepository.persist(user);
    project = modelFaker.project(user.id);
    await projectRepository.persist(project);
    role = modelFaker.role(project.id);
    await roleRepository.persist(role);
    session = request.agent(app.getHttpServer());
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/roles/:id/assign (POST)', () => {
    let assignee: UserModel;
    let assigneeId: string;
    let assigneeEmail: string;

    beforeEach(async () => {
      assignee = modelFaker.user();
      assigneeId = assignee.id.value;
      assigneeEmail = assignee.email.value;
      await userRepository.persist(assignee);
    });

    test('happy path', async () => {
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ assigneeId }));
    });

    test('happy path, email of user that exists', async () => {
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeEmail });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ assigneeId }));
    });

    test("happy path, email of user that doesn't exist", async () => {
      jest.spyOn(emailService, 'sendUnregisteredUserNewAssignmentEmail');
      assigneeEmail = primitiveFaker.email();
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeEmail });
      expect(response.status).toBe(200);
      expect(
        emailService.sendUnregisteredUserNewAssignmentEmail,
      ).toHaveBeenCalledWith(assigneeEmail);
    });

    test('project owner assignment is allowed', async () => {
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId: user.id });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({ assigneeId: user.id }),
      );
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(400);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = modelFaker.user();
      await userRepository.persist(otherUser);
      project.creatorId = otherUser.id;
      await projectRepository.persist(project);
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(403);
    });

    test('should fail is user is already assigned to another role of the same project', async () => {
      const anotherRole = modelFaker.role(project.id, assignee.id);
      await roleRepository.persist(anotherRole);
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(400);
    });
  });
});
