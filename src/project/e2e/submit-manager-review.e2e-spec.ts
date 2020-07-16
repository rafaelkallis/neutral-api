import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { InternalProject } from 'project/domain/project/Project';
import { User } from 'user/domain/User';
import { ManagerReviewProjectState } from 'project/domain/project/value-objects/states/ManagerReviewProjectState';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { FormationProjectState } from 'project/domain/project/value-objects/states/FormationProjectState';
import {
  ReadonlyUserCollection,
  UserCollection,
} from 'user/domain/UserCollection';
import { HttpStatus } from '@nestjs/common';

describe('submit manager review (e2e)', () => {
  let scenario: IntegrationTestScenario;
  let authUser: User;
  let project: InternalProject;
  let assignees: ReadonlyUserCollection;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();

    authUser = await scenario.createUser();
    await scenario.authenticateUser(authUser);

    /* prepare project */
    project = await scenario.createProject(authUser);
    project.state = ManagerReviewProjectState.INSTANCE;
    await scenario.projectRepository.persist(project);

    assignees = new UserCollection([
      await scenario.createUser(),
      await scenario.createUser(),
      await scenario.createUser(),
      await scenario.createUser(),
    ]);

    for (const assignee of assignees) {
      const role = scenario.modelFaker.role(assignee.id);
      project.roles.add(role);
    }
    await scenario.projectRepository.persist(project);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path', async () => {
    const response = await scenario.session.post(
      `/projects/${project.id.value}/submit-manager-review`,
    );
    expect(response.status).toBe(HttpStatus.OK);
    const updatedProject = await scenario.projectRepository.findById(
      project.id,
    );
    if (!updatedProject) {
      throw new Error();
    }
    expect(updatedProject.state).toBe(FinishedProjectState.INSTANCE);

    for (const assignee of assignees) {
      const receivedEmails = await scenario.getReceivedEmails(assignee.email);
      expect(receivedEmails).toHaveLength(1);
      expect(receivedEmails[0].subject).toBe(
        `[Covee] project "${project.title.toString()}" finished`,
      );
    }
  });

  test('should fail if project is not in manager-review state', async () => {
    project.state = FormationProjectState.INSTANCE;
    await scenario.projectRepository.persist(project);

    const response = await scenario.session.post(
      `/projects/${project.id.value}/submit-manager-review`,
    );
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  test('should fail if authenticated user is not the project creator', async () => {
    const otherUser = scenario.modelFaker.user();
    await scenario.userRepository.persist(otherUser);
    await scenario.authenticateUser(otherUser);

    const response = await scenario.session.post(
      `/projects/${project.id.value}/submit-manager-review`,
    );
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  });
});
