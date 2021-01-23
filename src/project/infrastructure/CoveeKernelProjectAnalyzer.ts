import {
  ProjectAnalyzer,
  ReviewTopicAnalysisResult,
} from 'project/domain/ProjectAnalyzer';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { Config } from 'shared/config/application/Config';
import { Milestone } from 'project/domain/milestone/Milestone';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { Agreement } from 'project/domain/value-objects/Agreement';
import { RoleMetricCollection } from 'project/domain/role-metric/RoleMetricCollection';
import { RoleMetric } from 'project/domain/role-metric/RoleMetric';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { MilestoneMetric } from 'project/domain/milestone-metric/MilestoneMetric';
import { ContributionSymmetry } from 'project/domain/value-objects/ContributionSymmetry';
import { plainToClass } from 'class-transformer';
import {
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
  validateSync,
} from 'class-validator';

class CoveeKernelResult {
  @IsNumber()
  @Min(0)
  @Max(1)
  public contribution_symmetry!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  public consensuality!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  public agreement!: number;

  @ValidateNested({ each: true })
  public role_metrics!: CoveeKernelResultRoleMetric[];
}

class CoveeKernelResultRoleMetric {
  @IsString()
  public role!: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  public contribution!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  public consensuality!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  public agreement!: number;
}

@Injectable()
export class CoveeKernelProjectAnalyzer extends ProjectAnalyzer {
  private readonly config: Config;

  public constructor(config: Config) {
    super();
    this.config = config;
  }

  protected async doAnalyze(
    milestone: Milestone,
    reviewTopic: ReadonlyReviewTopic,
  ): Promise<ReviewTopicAnalysisResult> {
    const url = new URL(
      '/v1/kernel/analyze-milestone',
      this.config.get('COVEE_KERNEL_BASE_URL'),
    );
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        title: `${milestone.project.title.toString()} ${milestone.title.toString()} ${reviewTopic.title.toString()}`.trim(),
        peer_reviews: milestone.peerReviews
          .whereReviewTopic(reviewTopic)
          .toArray()
          .map((peerReview) => ({
            source: peerReview.senderRoleId.toString(),
            target: peerReview.receiverRoleId.toString(),
            score: peerReview.score.value,
          })),
      }),
    });
    if (!response.ok) {
      throw new Error('covee kernel api request failed');
    }

    const resultJson = await response.json();
    const result = plainToClass(CoveeKernelResult, resultJson);
    const errors = validateSync(result);
    if (errors.length > 0) {
      throw new Error(
        `invalid result from kernel api: ${JSON.stringify(errors)}`,
      );
    }

    const roleMetrics = new RoleMetricCollection(
      result.role_metrics.map((roleMetric) =>
        RoleMetric.create(
          milestone.project,
          RoleId.from(roleMetric.role),
          reviewTopic.id,
          milestone.id,
          Contribution.of(roleMetric.contribution),
          Consensuality.of(roleMetric.consensuality),
          Agreement.of(roleMetric.agreement),
        ),
      ),
    );

    const milestoneMetric = MilestoneMetric.create(
      milestone.project,
      reviewTopic.id,
      milestone.id,
      ContributionSymmetry.of(result.contribution_symmetry),
      Consensuality.of(result.consensuality),
      Agreement.of(result.agreement),
    );

    return { roleMetrics, milestoneMetric };
  }
}
