import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { Project, ReadonlyProject } from 'project/domain/project/Project';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { InternalServerErrorException } from '@nestjs/common';

export class ConsensualityComputationResult extends Array<
  [ReviewTopicId, Consensuality]
> {
  public ofReviewTopic(reviewTopic: ReviewTopicId): Consensuality {
    for (const [otherReviewTopic, consensuality] of this) {
      if (reviewTopic.equals(otherReviewTopic)) {
        return consensuality;
      }
    }
    throw new InternalServerErrorException('review topic not found');
  }

  public applyTo(project: Project): void {
    for (const reviewTopic of project.reviewTopics) {
      reviewTopic.consensuality = this.ofReviewTopic(reviewTopic.id);
    }
  }
}

/**
 * Computes a project's consensuality.
 */
export abstract class ConsensualityComputer {
  /**
   * Computes a project's consensuality.
   */
  public compute(project: ReadonlyProject): ConsensualityComputationResult {
    const result = new ConsensualityComputationResult();
    for (const reviewTopic of project.reviewTopics) {
      const reviewTopicConsensuality = this.computeForReviewTopic(
        project.peerReviews.findByReviewTopic(reviewTopic.id),
      );
      result.push([reviewTopic.id, reviewTopicConsensuality]);
    }
    return result;
  }

  protected abstract computeForReviewTopic(
    peerReviews: ReadonlyPeerReviewCollection,
  ): Consensuality;
}
