import { Project } from 'project/domain/Project';
import { Role } from 'project/domain/Role';
import { User } from 'user/domain/User';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { HttpStatus } from '@nestjs/common';

describe('unassign role', () => {
  let scenario: IntegrationTestScenario;
  let creator: User;
  let project: Project;
  let roleToUnassign: Role;
  let assignee: User;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    creator = await scenario.createUser();
    assignee = await scenario.createUser();
    await scenario.authenticateUser(creator);
    project = scenario.modelFaker.project(creator.id);
    roleToUnassign = scenario.modelFaker.role(project.id);
    roleToUnassign.assigneeId = assignee.id;
    project.roles.add(roleToUnassign);
    await scenario.projectRepository.persist(project);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  describe('/projects/:project_id/roles/:role_id/unassign (POST)', () => {
    test('happy path', async () => {
      const response = await scenario.session.post(
        `/projects/${project.id.value}/roles/${roleToUnassign.id.value}/unassign`,
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: project.id.value,
          roles: expect.arrayContaining([
            expect.objectContaining({
              id: roleToUnassign.id.value,
              assigneeId: null,
            }),
          ]),
        }),
      );
    });
  });
});
