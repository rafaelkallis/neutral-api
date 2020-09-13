import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { Project, ReadonlyProject } from 'project/domain/project/Project';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import { ReadonlyReviewTopic } from './review-topic/ReviewTopic';
import { ReadonlyContributionCollection } from './contribution/ContributionCollection';

export interface ReviewTopicAnalysisResult {
  contributions: ReadonlyContributionCollection;
  consensuality: Consensuality;
}

export interface ProjectAnalysisResult
  extends ReadonlyMap<ReadonlyReviewTopic, ReviewTopicAnalysisResult> {
  applyTo(project: Project): void;
}

class InternalProjectAnalysisResult
  extends Map<ReadonlyReviewTopic, ReviewTopicAnalysisResult>
  implements ProjectAnalysisResult {
  public applyTo(project: Project): void {
    for (const reviewTopic of project.reviewTopics) {
      const reviewTopicResult = this.get(reviewTopic);
      if (!reviewTopicResult) {
        throw new Error('review topic not found in results');
      }
      reviewTopic.consensuality = reviewTopicResult.consensuality;
    }
  }
}

export abstract class ProjectAnalyzer {
  public async analyzeProject(
    project: ReadonlyProject,
  ): Promise<ProjectAnalysisResult> {
    const result = new InternalProjectAnalysisResult();
    for (const reviewTopic of project.reviewTopics) {
      const reviewTopicConsensuality = await this.analyzeReviewTopic(
        project.peerReviews.whereReviewTopic(reviewTopic.id),
        reviewTopic,
        project,
      );
      result.set(reviewTopic, reviewTopicConsensuality);
    }
    return result;
  }

  protected abstract analyzeReviewTopic(
    peerReviews: ReadonlyPeerReviewCollection,
    reviewTopic: ReadonlyReviewTopic,
    project: ReadonlyProject,
  ): Promise<ReviewTopicAnalysisResult>;
}
