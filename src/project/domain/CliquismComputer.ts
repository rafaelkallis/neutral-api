import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { Project, ReadonlyProject } from 'project/domain/project/Project';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { Cliquism } from 'project/domain/review-topic/value-objects/Cliquism';

export class CliquismComputationResult extends Array<
  [ReviewTopicId, Cliquism]
> {
  public ofReviewTopic(reviewTopic: ReviewTopicId): Cliquism {
    for (const [otherReviewTopic, cliquism] of this) {
      if (reviewTopic.equals(otherReviewTopic)) {
        return cliquism;
      }
    }
    throw new Error('review topic not found');
  }

  public applyTo(project: Project): void {
    for (const reviewTopic of project.reviewTopics) {
      reviewTopic.cliquism = this.ofReviewTopic(reviewTopic.id);
    }
  }
}

export abstract class CliquismComputer {
  public compute(project: ReadonlyProject): CliquismComputationResult {
    const result = new CliquismComputationResult();
    for (const reviewTopic of project.reviewTopics) {
      const reviewTopicCliquism = this.computeForReviewTopic(
        project.peerReviews.whereReviewTopic(reviewTopic.id),
      );
      result.push([reviewTopic.id, reviewTopicCliquism]);
    }
    return result;
  }

  protected abstract computeForReviewTopic(
    peerReviews: ReadonlyPeerReviewCollection,
  ): Cliquism;
}
