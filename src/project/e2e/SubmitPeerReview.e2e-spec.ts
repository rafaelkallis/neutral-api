import { Project } from 'project/domain/project/Project';
import { ReadonlyRole } from 'project/domain/role/Role';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { HttpStatus } from '@nestjs/common';
import { ManagerReviewProjectState } from 'project/domain/project/value-objects/states/ManagerReviewProjectState';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { UserCollection } from 'user/domain/UserCollection';

describe('submit peer review (e2e)', () => {
  let scenario: IntegrationTestScenario;

  let creator: User;
  let project: Project;
  let role1: ReadonlyRole;
  let role2: ReadonlyRole;
  let role3: ReadonlyRole;
  let role4: ReadonlyRole;
  let reviewTopic1: ReadonlyReviewTopic;
  let peerReviews: Record<string, number>;

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

    reviewTopic1 = project.addReviewTopic(
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
    project.clearDomainEvents();

    peerReviews = {
      [role2.id.value]: 0.3,
      [role3.id.value]: 0.2,
      [role4.id.value]: 0.5,
    };
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('should submit peer review', async () => {
    const response = await scenario.session
      .post(`/projects/${project.id.value}/submit-peer-reviews`)
      .send({ peerReviews, reviewTopicId: reviewTopic1.id.value });
    expect(response.status).toBe(200);
    const updatedProject = await scenario.projectRepository.findById(
      project.id,
    );
    if (!updatedProject) {
      throw new Error();
    }
    const sentPeerReviews = updatedProject.peerReviews.whereSenderRole(
      role1.id,
    );
    expect(sentPeerReviews.count()).toBe(3);
    for (const sentPeerReview of sentPeerReviews) {
      expect(sentPeerReview.score.value).toBe(
        peerReviews[sentPeerReview.receiverRoleId.value],
      );
    }
  });

  describe('when final peer review', () => {
    beforeEach(async () => {
      const contributionsComputer = scenario.module.get(ContributionsComputer);
      const consensualityComputer = scenario.module.get(ConsensualityComputer);
      for (const reviewTopic of project.reviewTopics) {
        for (const sender of project.roles) {
          if (reviewTopic.equals(reviewTopic1) && sender.equals(role1)) {
            // skip this one, will be submitted in test
            continue;
          }
          const peerReviews: [RoleId, PeerReviewScore][] = project.roles
            .whereNot(sender)
            .toArray()
            .map((receiver) => [
              receiver.id,
              PeerReviewScore.from(1 / (project.roles.count() - 1)),
            ]);
          project.submitPeerReviews(
            sender.id,
            reviewTopic.id,
            peerReviews,
            contributionsComputer,
            consensualityComputer,
          );
        }
      }
      await scenario.projectRepository.persist(project);
      project.clearDomainEvents();
    });

    test('should advance to project manager state', async () => {
      const response = await scenario.session
        .post(`/projects/${project.id.value}/submit-peer-reviews`)
        .send({ peerReviews, reviewTopicId: reviewTopic1.id.value });
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

    test('should send "manager review" email to project creator', async () => {
      const response = await scenario.session
        .post(`/projects/${project.id.value}/submit-peer-reviews`)
        .send({ peerReviews, reviewTopicId: reviewTopic1.id.value });
      expect(response.status).toBe(HttpStatus.OK);
      const receivedManagerEmails = await scenario.getReceivedEmails(creator);
      expect(receivedManagerEmails).toHaveLength(1);
      expect(receivedManagerEmails[0].subject).toBe(
        '[Covee] manager-review requested',
      );
    });

    test('should compute contributions', async () => {
      const response = await scenario.session
        .post(`/projects/${project.id.value}/submit-peer-reviews`)
        .send({ peerReviews, reviewTopicId: reviewTopic1.id.value });
      expect(response.status).toBe(HttpStatus.OK);
      const updatedProject = await scenario.projectRepository.findById(
        project.id,
      );
      if (!updatedProject) {
        throw new Error();
      }
      for (const reviewTopic of updatedProject.reviewTopics) {
        for (const role of updatedProject.roles) {
          const contribution = updatedProject.contributions
            .whereReviewTopic(reviewTopic)
            .whereRole(role)
            .firstOrNull();
          expect(contribution).toBeTruthy();
        }
      }
    });

    test('should compute consensuality', async () => {
      const response = await scenario.session
        .post(`/projects/${project.id.value}/submit-peer-reviews`)
        .send({ peerReviews, reviewTopicId: reviewTopic1.id.value });
      expect(response.status).toBe(HttpStatus.OK);
      const updatedProject = await scenario.projectRepository.findById(
        project.id,
      );
      if (!updatedProject) {
        throw new Error();
      }
      for (const reviewTopic of updatedProject.reviewTopics) {
        expect(reviewTopic.consensuality).toBeTruthy();
      }
    });
  });
});
