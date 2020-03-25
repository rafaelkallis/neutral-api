import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { Project } from 'project/domain/Project';
import { Role } from 'project/domain/Role';
import { User } from 'user/domain/User';
import { TestScenario } from 'test/TestScenario';

describe('assign user to role', () => {
  let scenario: TestScenario;
  let creator: User;
  let project: Project;
  let roleToAssign: Role;
  let assignee: User;
  let assigneeId: string;
  let assigneeEmail: string;

  beforeEach(async () => {
    scenario = await TestScenario.create();
    creator = await scenario.createUser();
    await scenario.authenticateUser(creator);
    project = scenario.modelFaker.project(creator.id);
    roleToAssign = scenario.modelFaker.role(project.id);
    project.roles.add(roleToAssign);
    await scenario.projectRepository.persist(project);

    assignee = scenario.modelFaker.user();
    await scenario.userRepository.persist(assignee);
    assigneeId = assignee.id.value;
    assigneeEmail = assignee.email.value;
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  describe('/roles/:id/assign (POST)', () => {
    test('happy path', async () => {
      const response = await scenario.session
        .post(`/roles/${roleToAssign.id.value}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ assigneeId }));
    });

    test('happy path, email of user that exists', async () => {
      const response = await scenario.session
        .post(`/roles/${roleToAssign.id.value}/assign`)
        .send({ assigneeEmail });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ assigneeId }));
    });

    test("happy path, email of user that doesn't exist", async () => {
      jest.spyOn(
        scenario.emailManager,
        'sendUnregisteredUserNewAssignmentEmail',
      );
      assigneeEmail = scenario.primitiveFaker.email();
      const response = await scenario.session
        .post(`/roles/${roleToAssign.id.value}/assign`)
        .send({ assigneeEmail });
      expect(response.status).toBe(200);
      expect(
        scenario.emailManager.sendUnregisteredUserNewAssignmentEmail,
      ).toHaveBeenCalledWith(assigneeEmail);
    });

    test('project owner assignment is allowed', async () => {
      const response = await scenario.session
        .post(`/roles/${roleToAssign.id.value}/assign`)
        .send({ assigneeId: creator.id.value });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({ assigneeId: creator.id.value }),
      );
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await scenario.projectRepository.persist(project);
      const response = await scenario.session
        .post(`/roles/${roleToAssign.id.value}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(400);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = scenario.modelFaker.user();
      await scenario.userRepository.persist(otherUser);
      project.creatorId = otherUser.id;
      await scenario.projectRepository.persist(project);
      const response = await scenario.session
        .post(`/roles/${roleToAssign.id.value}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(403);
    });

    test('should fail is user is already assigned to another role of the same project', async () => {
      const anotherRole = scenario.modelFaker.role(project.id, assignee.id);
      project.roles.add(anotherRole);
      await scenario.projectRepository.persist(project);
      const response = await scenario.session
        .post(`/roles/${roleToAssign.id.value}/assign`)
        .send({ assigneeId });
      expect(response.status).toBe(400);
    });
  });
});
