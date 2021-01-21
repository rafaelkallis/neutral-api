import {
  ProjectAnalyzer,
  ReviewTopicAnalysisResult,
} from 'project/domain/ProjectAnalyzer';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { Injectable } from '@nestjs/common';
import { Milestone } from 'project/domain/milestone/Milestone';
import { RoleMetricCollection } from 'project/domain/role-metric/RoleMetricCollection';
import { RoleMetric } from 'project/domain/role-metric/RoleMetric';
import { Contribution } from 'project/domain/role-metric/value-objects/Contribution';
import { Consensuality } from 'project/domain/role-metric/value-objects/Consensuality';
import { Agreement } from 'project/domain/role-metric/value-objects/Agreement';

@Injectable()
export class LegacyProjectAnalyzer extends ProjectAnalyzer {
  private readonly contributionComputer: ContributionsComputer;

  public constructor(
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ) {
    super();
    this.contributionComputer = contributionsComputer;
  }

  protected async doAnalyze(
    milestone: Milestone,
    reviewTopic: ReadonlyReviewTopic,
  ): Promise<ReviewTopicAnalysisResult> {
    const contributions = this.contributionComputer
      .compute(milestone)
      .whereReviewTopic(reviewTopic);
    return Promise.resolve({
      roleMetrics: new RoleMetricCollection(
        contributions
          .toArray()
          .map((contribution) =>
            RoleMetric.create(
              milestone.project,
              contribution.roleId,
              contribution.reviewTopicId,
              contribution.milestone.id,
              Contribution.of(contribution.amount.value),
              Consensuality.of(1),
              Agreement.of(1),
            ),
          ),
      ),
    });
  }
}
