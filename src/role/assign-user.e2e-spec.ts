import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { UserEntity, UserRepository, USER_REPOSITORY } from 'user';
import {
  ProjectEntity,
  ProjectState,
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project';
import { RoleEntity, RoleRepository } from 'role';
import { EntityFaker, PrimitiveFaker } from 'test';
import { EmailSender, EMAIL_SENDER } from 'email';
import { TokenService, TOKEN_SERVICE } from 'token';
import { ROLE_REPOSITORY } from 'role/repositories/role.repository';

describe('assign user to role', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let tokenService: TokenService;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let emailSender: EmailSender;
  let user: UserEntity;
  let project: ProjectEntity;
  let role: RoleEntity;
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
    tokenService = module.get(TOKEN_SERVICE);
    emailSender = module.get(EMAIL_SENDER);

    const app = module.createNestApplication();
    await app.init();

    user = entityFaker.user();
    await userRepository.persist(user);
    project = entityFaker.project(user.id);
    await projectRepository.persist(project);
    role = entityFaker.role(project.id);
    await roleRepository.persist(role);
    session = request.agent(app.getHttpServer());
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
      jest.spyOn(emailSender, 'sendUnregisteredUserNewAssignmentEmail');
      assigneeEmail = primitiveFaker.email();
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeEmail });
      expect(response.status).toBe(200);
      expect(
        emailSender.sendUnregisteredUserNewAssignmentEmail,
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
      const otherUser = entityFaker.user();
      await userRepository.persist(otherUser);
      project.ownerId = otherUser.id;
      await projectRepository.persist(project);
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(403);
    });

    test('should fail is user is already assigned to another role of the same project', async () => {
      const anotherRole = entityFaker.role(project.id, assignee.id);
      await roleRepository.persist(anotherRole);
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(400);
    });
  });
});
