import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app/AppModule';
import { UserRepository, USER_REPOSITORY } from 'user/domain/UserRepository';
import { ModelFaker, PrimitiveFaker } from 'test';
import { TokenManager, TOKEN_MANAGER } from 'token/application/TokenManager';
import { EmailManager, EMAIL_MANAGER } from 'email/EmailManager';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/domain/ProjectRepository';
import { Project } from 'project/domain/Project';
import { Role } from 'project/domain/Role';
import { User } from 'user/domain/User';

describe('assign user to role', () => {
  let app: INestApplication;
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let tokenService: TokenManager;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let emailService: EmailManager;
  let user: User;
  let project: Project;
  let role: Role;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    primitiveFaker = new PrimitiveFaker();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepository = module.get(USER_REPOSITORY);
    projectRepository = module.get(PROJECT_REPOSITORY);
    tokenService = module.get(TOKEN_MANAGER);
    emailService = module.get(EMAIL_MANAGER);

    app = module.createNestApplication();
    await app.init();

    user = modelFaker.user();
    await userRepository.persist(user);
    project = modelFaker.project(user.id);
    role = modelFaker.role(project.id);
    project.roles.add(role);
    await projectRepository.persist(project);
    session = request.agent(app.getHttpServer());
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/roles/:id/assign (POST)', () => {
    let assignee: User;
    let assigneeId: string;
    let assigneeEmail: string;

    beforeEach(async () => {
      assignee = modelFaker.user();
      await userRepository.persist(assignee);
      assigneeId = assignee.id.value;
      assigneeEmail = assignee.email.value;
    });

    test('happy path', async () => {
      const response = await session
        .post(`/roles/${role.id.value}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ assigneeId }));
    });

    test('happy path, email of user that exists', async () => {
      const response = await session
        .post(`/roles/${role.id.value}/assign`)
        .send({ assigneeEmail });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ assigneeId }));
    });

    test("happy path, email of user that doesn't exist", async () => {
      jest.spyOn(emailService, 'sendUnregisteredUserNewAssignmentEmail');
      assigneeEmail = primitiveFaker.email();
      const response = await session
        .post(`/roles/${role.id.value}/assign`)
        .send({ assigneeEmail });
      expect(response.status).toBe(200);
      expect(
        emailService.sendUnregisteredUserNewAssignmentEmail,
      ).toHaveBeenCalledWith(assigneeEmail);
    });

    test('project owner assignment is allowed', async () => {
      const response = await session
        .post(`/roles/${role.id.value}/assign`)
        .send({ assigneeId: user.id.value });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({ assigneeId: user.id.value }),
      );
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      const response = await session
        .post(`/roles/${role.id.value}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(400);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = modelFaker.user();
      await userRepository.persist(otherUser);
      project.creatorId = otherUser.id;
      await projectRepository.persist(project);
      const response = await session
        .post(`/roles/${role.id.value}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(403);
    });

    test('should fail is user is already assigned to another role of the same project', async () => {
      const anotherRole = modelFaker.role(project.id, assignee.id);
      project.roles.add(anotherRole);
      await projectRepository.persist(project);
      const response = await session
        .post(`/roles/${anotherRole.id.value}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(400);
    });
  });
});
