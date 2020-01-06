import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'app.module';
import { TokenService } from 'common';
import { UserEntity } from 'user';
import { ProjectEntity, ProjectState } from 'project';
import { RoleEntity } from 'role';
import { EntityFaker, PrimitiveFaker } from 'test';
import { TestModule } from 'test/test.module';
import { EmailSender, EMAIL_SENDER } from 'email';

describe('assign user to role', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let tokenService: TokenService;
  let emailSender: EmailSender;
  let user: UserEntity;
  let project: ProjectEntity;
  let role: RoleEntity;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();
    entityFaker = module.get(EntityFaker);
    primitiveFaker = module.get(PrimitiveFaker);

    user = entityFaker.user();
    await user.persist();
    project = entityFaker.project(user.id);
    await project.persist();
    role = entityFaker.role(project.id);
    await role.persist();

    const app = module.createNestApplication();
    await app.init();
    session = request.agent(app.getHttpServer());
    tokenService = module.get(TokenService);
    emailSender = module.get(EMAIL_SENDER);
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
      await assignee.persist();
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
      assigneeId = project.ownerId;
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ assigneeId }));
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await project.persist();
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(400);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = entityFaker.user();
      await otherUser.persist();
      project.ownerId = otherUser.id;
      await project.persist();
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(403);
    });

    test('should fail is user is already assigned to another role of the same project', async () => {
      const anotherRole = entityFaker.role(project.id, assignee.id);
      await anotherRole.persist();
      const response = await session
        .post(`/roles/${role.id}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(400);
    });
  });
});
