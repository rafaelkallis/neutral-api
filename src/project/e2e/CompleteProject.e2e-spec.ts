import { Project } from 'project/domain/project/Project';
import { ReadonlyRole } from 'project/domain/role/Role';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { HttpStatus } from '@nestjs/common';
import { ManagerReviewProjectState } from 'project/domain/project/value-objects/states/ManagerReviewProjectState';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { UserCollection } from 'user/domain/UserCollection';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { PeerReview } from 'project/domain/peer-review/PeerReview';

describe('complete project (e2e)', () => {
  let scenario: IntegrationTestScenario;

  let creator: User;
  let project: Project;
  let role1: ReadonlyRole;
  let role2: ReadonlyRole;
  let role3: ReadonlyRole;
  let role4: ReadonlyRole;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();

    creator = await scenario.createUser();

    const assignee1 = await scenario.createUser();
    const assignee2 = await scenario.createUser();
    const assignee3 = await scenario.createUser();
    const assignee4 = await scenario.createUser();

    await scenario.authenticateUser(assignee1);

    project = await scenario.createProject(creator);

    role1 = project.addRole(
      scenario.valueObjectFaker.role.title(),
      scenario.valueObjectFaker.role.description(),
    );
    role2 = project.addRole(
      scenario.valueObjectFaker.role.title(),
      scenario.valueObjectFaker.role.description(),
    );
    role3 = project.addRole(
      scenario.valueObjectFaker.role.title(),
      scenario.valueObjectFaker.role.description(),
    );
    role4 = project.addRole(
      scenario.valueObjectFaker.role.title(),
      scenario.valueObjectFaker.role.description(),
    );

    project.addReviewTopic(
      scenario.valueObjectFaker.reviewTopic.title(),
      scenario.valueObjectFaker.reviewTopic.description(),
      scenario.valueObjectFaker.reviewTopic.input(),
    );
    project.addReviewTopic(
      scenario.valueObjectFaker.reviewTopic.title(),
      scenario.valueObjectFaker.reviewTopic.description(),
      scenario.valueObjectFaker.reviewTopic.input(),
    );

    project.assignUserToRole(assignee1, role1.id);
    project.assignUserToRole(assignee2, role2.id);
    project.assignUserToRole(assignee3, role3.id);
    project.assignUserToRole(assignee4, role4.id);

    project.finishFormation(
      new UserCollection([assignee1, assignee2, assignee3, assignee4]),
    );

    await scenario.projectRepository.persist(project);

    const contributionsComputer = scenario.module.get(ContributionsComputer);
    const consensualityComputer = scenario.module.get(ConsensualityComputer);

    for (const reviewTopic of project.reviewTopics) {
      for (const sender of project.roles.whereNot(role3).whereNot(role4)) {
        const peerReviews = new PeerReviewCollection(
          project.roles
            .whereNot(sender)
            .toArray()
            .map((receiver) =>
              PeerReview.from(
                sender.id,
                receiver.id,
                reviewTopic.id,
                PeerReviewScore.equalSplit(project.roles.count()),
              ),
            ),
        );
        project.submitPeerReviews(
          peerReviews,
          contributionsComputer,
          consensualityComputer,
        );
      }
    }

    await scenario.projectRepository.persist(project);
    project.clearDomainEvents();
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('should advance project to manager-review', async () => {
    const response = await scenario.session.post(
      `/projects/${project.id.value}/complete`,
    );
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.state).toBe('manager-review');
    const updatedProject = await scenario.projectRepository.findById(
      project.id,
    );
    if (!updatedProject) {
      throw new Error();
    }
    expect(updatedProject.state).toBe(ManagerReviewProjectState.INSTANCE);
  });
});
