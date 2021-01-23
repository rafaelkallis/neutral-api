import { Project } from 'project/domain/project/Project';
import { ReadonlyReviewTopic } from './review-topic/ReviewTopic';
import { Milestone } from './milestone/Milestone';
import { RoleMetricCollection } from './role-metric/RoleMetricCollection';
import { Consensuality } from './project/value-objects/Consensuality';
import { MilestoneMetricCollection } from './milestone-metric/MilestoneMetricCollection';

export interface ReviewTopicAnalysisResult {
  roleMetrics: RoleMetricCollection;
  milestoneMetrics: MilestoneMetricCollection;
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
      project.roleMetrics.addAll(reviewTopicResult.roleMetrics);
      project.milestoneMetrics.addAll(reviewTopicResult.milestoneMetrics);
      reviewTopic.consensuality = Consensuality.from(1);
    }
  }
}

export abstract class ProjectAnalyzer {
  public async analyze(milestone: Milestone): Promise<ProjectAnalysisResult> {
    const result = new InternalProjectAnalysisResult();
    for (const reviewTopic of milestone.project.reviewTopics) {
      result.set(reviewTopic, await this.doAnalyze(milestone, reviewTopic));
    }
    return result;
  }

  protected abstract doAnalyze(
    milestone: Milestone,
    reviewTopic: ReadonlyReviewTopic,
  ): Promise<ReviewTopicAnalysisResult>;
}
