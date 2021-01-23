import { Project } from 'project/domain/project/Project';
import { ReadonlyRole } from 'project/domain/role/Role';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { User } from 'user/domain/User';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { HttpStatus } from '@nestjs/common';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { PeerReviewFlag } from 'project/domain/peer-review/value-objects/PeerReviewFlag';
import { ManagerReviewMilestoneState } from 'project/domain/milestone/value-objects/states/ManagerReviewMilestoneState';
import { ReadonlyMilestone } from 'project/domain/milestone/Milestone';
import { ProjectAnalyzer } from 'project/domain/ProjectAnalyzer';

describe('submit peer review (e2e)', () => {
  let scenario: IntegrationTestScenario;

  let creator: User;
  let project: Project;
  let role1: ReadonlyRole;
  let role2: ReadonlyRole;
  let role3: ReadonlyRole;
  let role4: ReadonlyRole;
  let reviewTopic1: ReadonlyReviewTopic;
  let milestone: ReadonlyMilestone;
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
    project.addReviewTopic(
      scenario.valueObjectFaker.reviewTopic.title(),
      scenario.valueObjectFaker.reviewTopic.description(),
      scenario.valueObjectFaker.reviewTopic.input(),
    );

    project.assignUserToRole(assignee1, role1.id);
    project.assignUserToRole(assignee2, role2.id);
    project.assignUserToRole(assignee3, role3.id);
    project.assignUserToRole(assignee4, role4.id);

    project.finishFormation();

    milestone = project.addMilestone(
      scenario.valueObjectFaker.milestone.title(),
      scenario.valueObjectFaker.milestone.description(),
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
    expect(response.status).toBe(HttpStatus.OK);
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

  test("should submit peer reviews with 1's and 0's", async () => {
    peerReviews = {
      [role2.id.value]: 0,
      [role3.id.value]: 1,
      [role4.id.value]: 0.0,
    };
    const response = await scenario.session
      .post(`/projects/${project.id.value}/submit-peer-reviews`)
      .send({
        peerReviews,
        reviewTopicId: project.reviewTopics.first().id.value,
      });
    expect(response.status).toBe(HttpStatus.OK);
    const updatedProject = await scenario.projectRepository.findById(
      project.id,
    );
    if (!updatedProject) {
      throw new Error();
    }
    expect(updatedProject.peerReviews.count()).toBe(
      project.peerReviews.count() + 3,
    );
  });

  describe('when final peer review', () => {
    beforeEach(async () => {
      const projectAnalyzer = scenario.module.get(ProjectAnalyzer);
      for (const reviewTopic of project.reviewTopics) {
        for (const sender of project.roles) {
          if (reviewTopic.equals(reviewTopic1) && sender.equals(role1)) {
            // skip this one, will be submitted in test
            continue;
          }
          const peerReviews = PeerReviewCollection.of(
            project.roles
              .whereNot(sender)
              .toArray()
              .map((receiver) =>
                PeerReview.create(
                  sender.id,
                  receiver.id,
                  reviewTopic.id,
                  milestone.id,
                  PeerReviewScore.of(1),
                  PeerReviewFlag.NONE,
                  project,
                ),
              ),
          );
          await project.submitPeerReviews(peerReviews, projectAnalyzer);
        }
      }

      await scenario.projectRepository.persist(project);
      project.clearDomainEvents();
    });

    test('should advance to manager review state', async () => {
      const response = await scenario.session
        .post(`/projects/${project.id.value}/submit-peer-reviews`)
        .send({
          peerReviews,
          reviewTopicId: project.reviewTopics.first().id.value,
        });
      expect(response.status).toBe(HttpStatus.OK);
      const updatedProject = await scenario.projectRepository.findById(
        project.id,
      );
      if (!updatedProject) {
        throw new Error();
      }
      expect(updatedProject.latestMilestone.state).toBe(
        ManagerReviewMilestoneState.INSTANCE,
      );
    });

    test('should send "manager review" email to project creator', async () => {
      const response = await scenario.session
        .post(`/projects/${project.id.value}/submit-peer-reviews`)
        .send({ peerReviews, reviewTopicId: reviewTopic1.id.value });
      expect(response.status).toBe(HttpStatus.OK);
      const receivedManagerEmails = await scenario.getReceivedEmails(creator);
      expect(receivedManagerEmails).toHaveLength(1);
      expect(receivedManagerEmails[0].subject).toBe(
        `[Covee] manager-review requested in "${project.title.toString()}"`,
      );
    });

    test('should compute contributions', async () => {
      const response = await scenario.session
        .post(`/projects/${project.id.toString()}/submit-peer-reviews`)
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
          const roleMetric = updatedProject.roleMetrics
            .whereRole(role)
            .whereReviewTopic(reviewTopic)
            .whereMilestone(updatedProject.latestMilestone)
            .firstOrNull();
          expect(roleMetric).toBeTruthy();
        }
        const milestoneMetric = updatedProject.milestoneMetrics
          .whereReviewTopic(reviewTopic)
          .whereMilestone(updatedProject.latestMilestone)
          .firstOrNull();
        expect(milestoneMetric).toBeTruthy();
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
