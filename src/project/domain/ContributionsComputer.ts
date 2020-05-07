import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { Contribution } from 'project/domain/contribution/Contribution';
import { Project } from 'project/domain/project/Project';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

/**
 * Contributions Computer
 */
export abstract class ContributionsComputer {
  /**
   * Computes the relative contributions.
   */
  public compute(
    peerReviews: ReadonlyPeerReviewCollection,
  ): ContributionsComputationResult {
    const result = new ContributionsComputationResult();
    for (const reviewTopic of peerReviews.getReviewTopics()) {
      const contributions = this.computeForReviewTopic(
        reviewTopic,
        peerReviews.findByReviewTopic(reviewTopic),
      );
      result.push(...contributions);
    }
    return result;
  }

  protected abstract computeForReviewTopic(
    reviewTopic: ReviewTopicId,
    peerReviews: ReadonlyPeerReviewCollection,
  ): ReadonlyArray<Contribution>;
}

export class ContributionsComputationResult extends Array<Contribution> {
  public applyTo(project: Project): void {
    project.contributions.addAll(this);
  }
}
