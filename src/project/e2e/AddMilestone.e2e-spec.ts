import { Project } from 'project/domain/project/Project';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { HttpStatus } from '@nestjs/common';
import { ProjectTestHelper } from 'test/ProjectTestHelper';
import {
  ReadonlyUserCollection,
  UserCollection,
} from 'user/domain/UserCollection';

describe('/projects/:id/milestones (POST)', () => {
  let scenario: IntegrationTestScenario;
  let user: User;
  let assignees: ReadonlyUserCollection;
  let project: Project;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    user = await scenario.createUser();
    await scenario.authenticateUser(user);
    assignees = new UserCollection([
      await scenario.createUser(),
      await scenario.createUser(),
      await scenario.createUser(),
      await scenario.createUser(),
    ]);
    project = await scenario.createProject(user);
    const projectHelper = ProjectTestHelper.of(project);
    projectHelper.addRolesAndAssign(assignees);
    projectHelper.addReviewTopics(2);
    project.finishFormation();
    await scenario.projectRepository.persist(project);
    project.clearDomainEvents();
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path', async () => {
    const response = await scenario.session.post(
      `/projects/${project.id.value}/milestones`,
    );
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toBeDefined();
    const updatedProject = await scenario.projectRepository.findById(
      project.id,
    );
    if (!updatedProject) {
      throw new Error();
    }
    expect(updatedProject.milestones).toHaveLength(1);
    for (const assignee of assignees) {
      const receivedEmails = await scenario.getReceivedEmails(assignee);
      expect(receivedEmails).toHaveLength(1);
      expect(receivedEmails[0].subject).toBe(
        `[Covee] peer-review requested in "${project.title.toString()}"`,
      );
    }
  });

  test('should fail if authenticated user is not project owner', async () => {
    const otherUser = scenario.modelFaker.user();
    await scenario.userRepository.persist(otherUser);
    await scenario.authenticateUser(otherUser);
    const response = await scenario.session.post(
      `/projects/${project.id.value}/milestones`,
    );
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  });
});
