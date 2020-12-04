import { Project } from 'project/domain/project/Project';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { InternalServerErrorException } from '@nestjs/common';
import { ReadonlyMilestone } from './milestone/Milestone';

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
  public compute(milestone: ReadonlyMilestone): ConsensualityComputationResult {
    const result = new ConsensualityComputationResult();
    for (const reviewTopic of milestone.project.reviewTopics) {
      const peerReviews = milestone.peerReviews
        .whereReviewTopic(reviewTopic.id)
        .toNormalizedMap();
      const reviewTopicConsensuality = this.doCompute(peerReviews);
      result.push([reviewTopic.id, reviewTopicConsensuality]);
    }
    return result;
  }

  protected abstract doCompute(
    peerReviews: Record<string, Record<string, number>>,
  ): Consensuality;
}
