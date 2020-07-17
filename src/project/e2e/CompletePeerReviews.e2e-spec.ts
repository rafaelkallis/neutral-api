import { Project } from 'project/domain/project/Project';
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

describe('complete peer reviews (e2e)', () => {
  let scenario: IntegrationTestScenario;

  let creator: User;
  let project: Project;
  let assignees: UserCollection;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();

    creator = await scenario.createUser();

    await scenario.authenticateUser(creator);

    project = await scenario.createProject(creator);

    project.addRole(
      scenario.valueObjectFaker.role.title(),
      scenario.valueObjectFaker.role.description(),
    );
    project.addRole(
      scenario.valueObjectFaker.role.title(),
      scenario.valueObjectFaker.role.description(),
    );
    project.addRole(
      scenario.valueObjectFaker.role.title(),
      scenario.valueObjectFaker.role.description(),
    );
    project.addRole(
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

    assignees = new UserCollection([]);
    for (const role of project.roles) {
      const assignee = await scenario.createUser();
      assignees.add(assignee);
      project.assignUserToRole(assignee, role.id);
    }
    project.finishFormation(assignees);

    await scenario.projectRepository.persist(project);

    const contributionsComputer = scenario.module.get(ContributionsComputer);
    const consensualityComputer = scenario.module.get(ConsensualityComputer);

    // suppose roles 3 + 4 never submitted peer reviews
    const [, , ro3, ro4] = project.roles;
    for (const reviewTopic of project.reviewTopics) {
      for (const sender of project.roles.whereNot(ro3).whereNot(ro4)) {
        const peerReviews = PeerReviewCollection.of(
          project.roles
            .whereNot(sender)
            .toArray()
            .map((receiver) =>
              PeerReview.from(
                sender.id,
                receiver.id,
                reviewTopic.id,
                PeerReviewScore.of(1),
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
      `/projects/${project.id.value}/complete-peer-reviews`,
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

  test('should fail if authenticated user is not project creator', async () => {
    await scenario.authenticateUser(assignees.first());
    const response = await scenario.session.post(
      `/projects/${project.id.value}/complete-peer-reviews`,
    );
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  });
});
