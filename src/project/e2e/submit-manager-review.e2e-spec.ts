import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { Project } from 'project/domain/Project';
import { User } from 'user/domain/User';
import { ProjectManagerReview } from 'project/domain/value-objects/states/ProjectManagerReview';
import { ProjectFinished } from 'project/domain/value-objects/states/ProjectFinished';
import { ProjectFormation } from 'project/domain/value-objects/states/ProjectFormation';

describe('submit manager review (e2e)', () => {
  let scenario: IntegrationTestScenario;
  let user: User;
  let project: Project;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();

    user = await scenario.createUser();
    await scenario.authenticateUser(user);

    /* prepare project */
    project = scenario.modelFaker.project(user.id);
    project.state = ProjectManagerReview.INSTANCE;
    await scenario.projectRepository.persist(project);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path', async () => {
    const response = await scenario.session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(200);
    const updatedProject = await scenario.projectRepository.findById(
      project.id,
    );
    if (!updatedProject) {
      throw new Error();
    }
    expect(updatedProject.state).toBe(ProjectFinished.INSTANCE);
  });

  test('should fail if project is not in manager-review state', async () => {
    project.state = ProjectFormation.INSTANCE;
    await scenario.projectRepository.persist(project);

    const response = await scenario.session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(400);
  });

  test('should fail if authenticated user is not the project creator', async () => {
    const otherUser = scenario.modelFaker.user();
    await scenario.userRepository.persist(otherUser);
    await scenario.authenticateUser(otherUser);

    const response = await scenario.session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(403);
  });
});
