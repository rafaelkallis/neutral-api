import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { TestScenario } from 'test/TestScenario';
import { Project } from 'project/domain/Project';
import { User } from 'user/domain/User';

describe('submit manager review (e2e)', () => {
  let scenario: TestScenario;
  let user: User;
  let project: Project;

  beforeEach(async () => {
    scenario = await TestScenario.create();

    user = await scenario.createUser();
    await scenario.authenticateUser(user);

    /* prepare project */
    project = scenario.modelFaker.project(user.id);
    project.state = ProjectState.MANAGER_REVIEW;
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
    const updatedProjectOptional = await scenario.projectRepository.findById(
      project.id,
    );
    const updatedProject = updatedProjectOptional.orElseThrow(Error);
    expect(updatedProject.state).toBe(ProjectState.FINISHED);
  });

  test('should fail if project is not in manager-review state', async () => {
    project.state = ProjectState.FORMATION;
    await scenario.projectRepository.persist(project);

    const response = await scenario.session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(400);
  });

  test('should fail if authenticated user is not the project owner', async () => {
    const otherUser = scenario.modelFaker.user();
    await scenario.userRepository.persist(otherUser);
    project.creatorId = otherUser.id;
    await scenario.projectRepository.persist(project);

    const response = await scenario.session.post(
      `/projects/${project.id}/submit-manager-review`,
    );
    expect(response.status).toBe(403);
  });
});
