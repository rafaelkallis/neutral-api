import { Project } from 'project/domain/project/Project';
import { ReadonlyReviewTopic } from './review-topic/ReviewTopic';
import { Milestone } from './milestone/Milestone';
import { RoleMetricCollection } from './role-metric/RoleMetricCollection';
import { Contribution } from './contribution/Contribution';
import { Consensuality } from './project/value-objects/Consensuality';
import { ContributionAmount } from './role/value-objects/ContributionAmount';

export interface ReviewTopicAnalysisResult {
  roleMetrics: RoleMetricCollection;
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

      // TODO remove
      project.contributions.addAll(
        reviewTopicResult.roleMetrics
          .toArray()
          .map((roleMetric) =>
            Contribution.from(
              project.milestones.whereId(roleMetric.milestoneId),
              roleMetric.roleId,
              roleMetric.reviewTopicId,
              ContributionAmount.from(roleMetric.contribution.value),
            ),
          ),
      );
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
