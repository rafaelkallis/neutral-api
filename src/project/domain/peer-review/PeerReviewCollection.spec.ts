import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ModelFaker } from 'test/ModelFaker';
import { InternalProject } from 'project/domain/project/Project';
import { ReviewTopicId } from '../review-topic/value-objects/ReviewTopicId';
import { PeerReview } from './PeerReview';
import { PeerReviewScore } from './value-objects/PeerReviewScore';
import { RoleId } from '../role/value-objects/RoleId';
import { PeerReviewFlag } from './value-objects/PeerReviewFlag';

describe('' + PeerReviewCollection.name, () => {
  let peerReviewCollection: PeerReviewCollection;
  let project: InternalProject;
  let modelFaker: ModelFaker;

  beforeEach(() => {
    modelFaker = new ModelFaker();
    const creator = modelFaker.user();
    project = modelFaker.project(creator.id);
    project.roles.add(modelFaker.role());
    project.roles.add(modelFaker.role());
    project.roles.add(modelFaker.role());
    project.roles.add(modelFaker.role());
    project.reviewTopics.add(modelFaker.reviewTopic());
    project.reviewTopics.add(modelFaker.reviewTopic());
    project.reviewTopics.add(modelFaker.reviewTopic());
    project.milestones.add(modelFaker.milestone(project));
    peerReviewCollection = PeerReviewCollection.empty();
    project.peerReviews = peerReviewCollection;
  });

  test.todo('whereSenderRole');
  test.todo('whereReceiverRole');
  test.todo('whereReviewTopic');
  describe('areSubmittedForSenderRoleAndReviewTopic', () => {
    let senderRoleId: RoleId;
    let reviewTopicId: ReviewTopicId;

    beforeEach(() => {
      senderRoleId = project.roles.first().id;
      reviewTopicId = project.reviewTopics.first().id;
    });

    test('when empty should return false', () => {
      expect(
        project.latestMilestone.peerReviews.areCompleteForSenderRoleAndReviewTopic(
          project.latestMilestone,
          senderRoleId,
          reviewTopicId,
        ),
      ).toBeFalsy();
    });

    test('when partially submitted should return false', () => {
      const [, secondRole, thirdRole] = project.roles.toArray();
      for (const receiver of [secondRole, thirdRole]) {
        const peerReview = PeerReview.create(
          senderRoleId,
          receiver.id,
          reviewTopicId,
          project.latestMilestone.id,
          PeerReviewScore.of(1),
          PeerReviewFlag.NONE,
          project,
        );
        project.peerReviews.add(peerReview);
      }
      expect(
        project.peerReviews.areCompleteForSenderRoleAndReviewTopic(
          project.latestMilestone,
          senderRoleId,
          reviewTopicId,
        ),
      ).toBeFalsy();
    });

    test('when all submitted should return true', () => {
      for (const receiver of project.roles.whereNot(senderRoleId)) {
        const peerReview = PeerReview.create(
          senderRoleId,
          receiver.id,
          reviewTopicId,
          project.latestMilestone.id,
          PeerReviewScore.of(1),
          PeerReviewFlag.NONE,
          project,
        );
        project.peerReviews.add(peerReview);
      }
      expect(
        project.peerReviews.areCompleteForSenderRoleAndReviewTopic(
          project.latestMilestone,
          senderRoleId,
          reviewTopicId,
        ),
      ).toBeTruthy();
    });
  });

  describe('areSubmitted()', () => {
    test('when empty should return false', () => {
      expect(
        project.peerReviews.areComplete(project.latestMilestone),
      ).toBeFalsy();
    });

    test('when 1 review topic submitted should return false', () => {
      const [firstReviewTopic] = project.reviewTopics.toArray();
      submitPeerReviewsForReviewTopic(firstReviewTopic.id);
      expect(
        project.peerReviews.areComplete(project.latestMilestone),
      ).toBeFalsy();
    });

    test('when 2 review topics submitted should return false', () => {
      const [
        firstReviewTopic,
        secondReviewTopic,
      ] = project.reviewTopics.toArray();
      submitPeerReviewsForReviewTopic(firstReviewTopic.id);
      submitPeerReviewsForReviewTopic(secondReviewTopic.id);
      expect(
        project.peerReviews.areComplete(project.latestMilestone),
      ).toBeFalsy();
    });

    test('when 3 review topics submitted should return true', () => {
      const [
        firstReviewTopic,
        secondReviewTopic,
        thirdReviewTopic,
      ] = project.reviewTopics.toArray();
      submitPeerReviewsForReviewTopic(firstReviewTopic.id);
      submitPeerReviewsForReviewTopic(secondReviewTopic.id);
      submitPeerReviewsForReviewTopic(thirdReviewTopic.id);
      expect(
        project.peerReviews.areComplete(project.latestMilestone),
      ).toBeTruthy();
    });
  });

  function submitPeerReviewsForReviewTopic(reviewTopicId: ReviewTopicId): void {
    for (const sender of project.roles) {
      for (const receiver of project.roles.whereNot(sender)) {
        const peerReview = PeerReview.create(
          sender.id,
          receiver.id,
          reviewTopicId,
          project.latestMilestone.id,
          PeerReviewScore.of(1),
          PeerReviewFlag.NONE,
          project,
        );
        project.peerReviews.add(peerReview);
      }
    }
  }
});
