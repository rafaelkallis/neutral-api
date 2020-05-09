import { Project } from 'project/domain/project/Project';
import { Role } from 'project/domain/role/Role';
import { User } from 'user/domain/User';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { HttpStatus } from '@nestjs/common';

describe('assign user to role', () => {
  let scenario: IntegrationTestScenario;
  let creator: User;
  let project: Project;
  let roleToAssign: Role;
  let assignee: User;
  let assigneeId: string;
  let assigneeEmail: string;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    creator = await scenario.createUser();
    await scenario.authenticateUser(creator);
    project = scenario.modelFaker.project(creator.id);
    roleToAssign = scenario.modelFaker.role();
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

  describe('/projects/:project_id/roles/:role_id/assign (POST)', () => {
    test('happy path', async () => {
      const response = await scenario.session
        .post(
          `/projects/${project.id.value}/roles/${roleToAssign.id.value}/assign`,
        )
        .send({ assigneeId });
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: project.id.value,
          roles: expect.arrayContaining([
            expect.objectContaining({
              id: roleToAssign.id.value,
              assigneeId,
            }),
          ]),
        }),
      );
    });

    test("happy path, email of user that doesn't exist", async () => {
      jest.spyOn(scenario.emailManager, 'sendInvitedUserNewAssignmentEmail');
      assigneeEmail = scenario.primitiveFaker.email();

      const response = await scenario.session
        .post(
          `/projects/${project.id.value}/roles/${roleToAssign.id.value}/assign`,
        )
        .send({ assigneeEmail });
      expect(response.status).toBe(HttpStatus.OK);
      expect(
        scenario.emailManager.sendInvitedUserNewAssignmentEmail,
      ).toHaveBeenCalledWith(
        assigneeEmail,
        project.id.value,
        project.title.value,
        roleToAssign.title.value,
        '',
      ); // TODO signupMagicLink
    });
  });
});
