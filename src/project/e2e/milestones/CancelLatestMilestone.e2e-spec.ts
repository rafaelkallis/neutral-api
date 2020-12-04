import { Project } from 'project/domain/project/Project';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { HttpStatus } from '@nestjs/common';
import { ProjectTestHelper } from 'test/ProjectTestHelper';
import {
  ReadonlyUserCollection,
  UserCollection,
} from 'user/domain/UserCollection';
import { CancelledMilestoneState } from 'project/domain/milestone/value-objects/states/CancelledMilestoneState';

describe('/projects/:id/milestones/latest (DELETE)', () => {
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
    projectHelper.addMilestone();
    project.clearDomainEvents();
    await scenario.projectRepository.persist(project);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path', async () => {
    const response = await scenario.session.delete(
      `/projects/${project.id.toString()}/milestones/latest`,
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
    expect(updatedProject.latestMilestone.state).toBe(
      CancelledMilestoneState.INSTANCE,
    );
  });

  test('should fail if authenticated user is not project owner', async () => {
    const otherUser = scenario.modelFaker.user();
    await scenario.userRepository.persist(otherUser);
    await scenario.authenticateUser(otherUser);
    const response = await scenario.session.delete(
      `/projects/${project.id.toString()}/milestones/latest`,
    );
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  });
});
