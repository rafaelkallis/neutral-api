import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module';
import { TokenService, EmailService } from '../common';
import { UserEntity, UserRepository } from '../user';
import { ProjectEntity, ProjectState, ProjectRepository } from '../project';
import { RoleEntity, RoleRepository } from '../role';
import { entityFaker, primitiveFaker } from '../test';

describe('assign user to role', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let tokenService: TokenService;
  let emailService: EmailService;
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
    tokenService = module.get(TokenService);
    emailService = module.get(EmailService);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  describe('/roles/:id/assign (POST)', () => {
    let assignee: UserEntity;
    let assigneeId: string;
    let assigneeEmail: string;

    beforeEach(async () => {
      assignee = entityFaker.user();
      assigneeId = assignee.id;
      assigneeEmail = assignee.email;
      await userRepository.save(assignee);
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
      assigneeId = project.ownerId;
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ assigneeId }));
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.save(project);
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(400);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = entityFaker.user();
      await userRepository.save(otherUser);
      project.ownerId = otherUser.id;
      await projectRepository.save(project);
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(403);
    });

    test('should fail is user is already assigned to another role of the same project', async () => {
      const anotherRole = entityFaker.role(project.id, assignee.id);
      await roleRepository.save(anotherRole);
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(400);
    });
  });
});
