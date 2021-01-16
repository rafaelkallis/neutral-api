import {
  ProjectAnalyzer,
  ReviewTopicAnalysisResult,
} from 'project/domain/ProjectAnalyzer';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { Config } from 'shared/config/application/Config';
import { ContributionCollection } from 'project/domain/contribution/ContributionCollection';
import { Contribution } from 'project/domain/contribution/Contribution';
import { ReadonlyMilestone } from 'project/domain/milestone/Milestone';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ContributionAmount } from 'project/domain/role/value-objects/ContributionAmount';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';

interface CoveeKernelResult {
  contribution_equality: number;
  contributions: Array<{
    role: string;
    value: number;
  }>;
  consensualities: Array<{
    role: string;
    value: number;
  }>;
  agreements: Array<{
    role: string;
    value: number;
  }>;
}

@Injectable()
export class CoveeKernelProjectAnalyzer extends ProjectAnalyzer {
  private readonly config: Config;

  public constructor(config: Config) {
    super();
    this.config = config;
  }

  protected async doAnalyze(
    milestone: ReadonlyMilestone,
    reviewTopic: ReadonlyReviewTopic,
  ): Promise<ReviewTopicAnalysisResult> {
    const url = new URL(
      '/v1/kernel/analyze-project',
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
    const result: CoveeKernelResult = await response.json();

    const contributions = new ContributionCollection(
      result.contributions.map((contribution) =>
        Contribution.from(
          milestone,
          RoleId.from(contribution.role),
          reviewTopic.id,
          ContributionAmount.from(contribution.value),
        ),
      ),
    );
    const consensuality = Consensuality.from(
      mean(result.consensualities.map((c) => c.value)),
    );

    return { contributions, consensuality };

    function mean(values: number[]): number {
      return values.reduce((a, b) => a + b) / values.length;
    }
  }
}
