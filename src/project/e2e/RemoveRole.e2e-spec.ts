import { Project } from 'project/domain/project/Project';
import { Role } from 'project/domain/role/Role';
import { User } from 'user/domain/User';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { HttpStatus } from '@nestjs/common';

describe('remove role (e2e)', () => {
  let scenario: IntegrationTestScenario;
  let creator: User;
  let project: Project;
  let roleToRemove: Role;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    creator = await scenario.createUser();
    await scenario.authenticateUser(creator);
    project = scenario.modelFaker.project(creator.id);
    roleToRemove = scenario.modelFaker.role();
    project.roles.add(roleToRemove);
    await scenario.projectRepository.persist(project);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  describe('/projects/:project_id/roles/:role_id (DELETE)', () => {
    test('happy path', async () => {
      const response = await scenario.session.delete(
        `/projects/${project.id.value}/roles/${roleToRemove.id.value}`,
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: project.id.value,
          roles: expect.not.arrayContaining([
            expect.objectContaining({
              id: roleToRemove.id.value,
            }),
          ]),
        }),
      );
    });
  });
});
