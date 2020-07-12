import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { Contribution } from 'project/domain/contribution/Contribution';
import { ReadonlyProject } from 'project/domain/project/Project';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ContributionCollection } from './contribution/ContributionCollection';

/**
 * Contributions Computer
 */
export abstract class ContributionsComputer {
  /**
   * Computes the relative contributions.
   */
  public compute(project: ReadonlyProject): ContributionCollection {
    const result = new ContributionCollection([]);
    for (const reviewTopic of project.reviewTopics) {
      const contributions = this.computeForReviewTopic(
        reviewTopic.id,
        project.peerReviews.whereReviewTopic(reviewTopic.id),
      );
      result.addAll(contributions);
    }
    return result;
  }

  protected abstract computeForReviewTopic(
    reviewTopic: ReviewTopicId,
    peerReviews: ReadonlyPeerReviewCollection,
  ): ReadonlyArray<Contribution>;
}
