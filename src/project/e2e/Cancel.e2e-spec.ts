import { Project } from 'project/domain/project/Project';
import { User } from 'user/domain/User';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { HttpStatus } from '@nestjs/common';
import { ProjectStateValue } from 'project/domain/project/value-objects/states/ProjectStateValue';

describe('cancel project', () => {
  let scenario: IntegrationTestScenario;
  let creator: User;
  let project: Project;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    creator = await scenario.createUser();
    await scenario.authenticateUser(creator);
    project = await scenario.createProject(creator);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  describe('/projects/:project_id/cancel (POST)', () => {
    test('happy path', async () => {
      const response = await scenario.session.post(
        `/projects/${project.id.value}/cancel`,
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: project.id.value,
          state: ProjectStateValue.CANCELLED,
        }),
      );
    });
  });
});
