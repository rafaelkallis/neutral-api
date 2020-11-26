import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { Project } from 'project/domain/project/Project';
import { User } from 'user/domain/User';
import {
  ReadonlyUserCollection,
  UserCollection,
} from 'user/domain/UserCollection';
import { HttpStatus } from '@nestjs/common';
import { ProjectTestHelper } from 'test/ProjectTestHelper';
import { ManagerReviewMilestoneState } from 'project/domain/milestone/value-objects/states/ManagerReviewMilestoneState';
import { FinishedMilestoneState } from 'project/domain/milestone/value-objects/states/FinishedMilestoneState';

describe('submit manager review (e2e)', () => {
  let scenario: IntegrationTestScenario;
  let authUser: User;
  let projectHelper: ProjectTestHelper;
  let project: Project;
  let assignees: ReadonlyUserCollection;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();

    authUser = await scenario.createUser();
    await scenario.authenticateUser(authUser);

    /* prepare project */
    project = await scenario.createProject(authUser);
    projectHelper = ProjectTestHelper.of(project);

    assignees = new UserCollection([
      await scenario.createUser(),
      await scenario.createUser(),
      await scenario.createUser(),
      await scenario.createUser(),
    ]);

    for (const assignee of assignees) {
      projectHelper.addRoleAndAssign(assignee);
    }

    projectHelper.addReviewTopic();
    projectHelper.addReviewTopic();
    projectHelper.addReviewTopic();

    project.finishFormation(assignees);

    projectHelper.addMilestone();

    await projectHelper.completePeerReviews();

    await scenario.projectRepository.persist(project);

    if (
      !project.milestones
        .whereLatest()
        .state.equals(ManagerReviewMilestoneState.INSTANCE)
    ) {
      throw new Error(
        'invariant violation: milestone state should be manager review.',
      );
    }
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
    const milestone = updatedProject.milestones.whereLatest();
    expect(milestone.state).toBe(FinishedMilestoneState.INSTANCE);

    for (const assignee of assignees) {
      const receivedEmails = await scenario.getReceivedEmails(assignee.email);
      expect(receivedEmails).toHaveLength(1);
      expect(receivedEmails[0].subject).toBe(
        `[Covee] project "${project.title.toString()}" finished`,
      );
    }
  });

  test('should fail if project is not in manager-review state', async () => {
    await projectHelper.completePeerReviews();
    project.submitManagerReview();
    if (
      !project.milestones
        .whereLatest()
        .state.equals(FinishedMilestoneState.INSTANCE)
    ) {
      throw new Error(
        'invariant violation: milestone should be finished state.',
      );
    }
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
