import { Project } from 'project/domain/project/Project';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import { ReadonlyReviewTopic } from './review-topic/ReviewTopic';
import { ContributionCollection } from './contribution/ContributionCollection';
import { ReadonlyMilestone } from './milestone/Milestone';

export interface ReviewTopicAnalysisResult {
  contributions: ContributionCollection;
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
      project.contributions.addAll(reviewTopicResult.contributions);
      reviewTopic.consensuality = reviewTopicResult.consensuality;
    }
  }
}

export abstract class ProjectAnalyzer {
  public async analyze(
    milestone: ReadonlyMilestone,
  ): Promise<ProjectAnalysisResult> {
    const result = new InternalProjectAnalysisResult();
    for (const reviewTopic of milestone.project.reviewTopics) {
      result.set(reviewTopic, await this.doAnalyze(milestone, reviewTopic));
    }
    return result;
  }

  protected abstract doAnalyze(
    milestone: ReadonlyMilestone,
    reviewTopic: ReadonlyReviewTopic,
  ): Promise<ReviewTopicAnalysisResult>;
}
