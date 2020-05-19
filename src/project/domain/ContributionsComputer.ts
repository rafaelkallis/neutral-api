import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { Contribution } from 'project/domain/contribution/Contribution';
import { Project, ReadonlyProject } from 'project/domain/project/Project';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

/**
 * Contributions Computer
 */
export abstract class ContributionsComputer {
  /**
   * Computes the relative contributions.
   */
  public compute(project: ReadonlyProject): ContributionsComputationResult {
    const result = new ContributionsComputationResult();
    for (const reviewTopic of project.reviewTopics) {
      const contributions = this.computeForReviewTopic(
        reviewTopic.id,
        project.peerReviews.whereReviewTopic(reviewTopic.id),
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
