import {
  ProjectAnalyzer,
  ReviewTopicAnalysisResult,
} from 'project/domain/ProjectAnalyzer';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { Config } from 'shared/config/application/Config';
import { Milestone } from 'project/domain/milestone/Milestone';
import { Contribution } from 'project/domain/role-metric/value-objects/Contribution';
import { Consensuality } from 'project/domain/role-metric/value-objects/Consensuality';
import { Agreement } from 'project/domain/role-metric/value-objects/Agreement';
import { RoleMetricCollection } from 'project/domain/role-metric/RoleMetricCollection';
import { RoleMetric } from 'project/domain/role-metric/RoleMetric';
import { RoleId } from 'project/domain/role/value-objects/RoleId';

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
    milestone: Milestone,
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

    const contributions: Record<string, Contribution> = Object.fromEntries(
      result.contributions.map(({ role, value }) => [
        role,
        Contribution.of(value),
      ]),
    );
    const consensualities: Record<string, Consensuality> = Object.fromEntries(
      result.consensualities.map(({ role, value }) => [
        role,
        Consensuality.of(value),
      ]),
    );
    const agreements: Record<string, Agreement> = Object.fromEntries(
      result.agreements.map(({ role, value }) => [role, Agreement.of(value)]),
    );

    if (
      !setEquals(
        new Set(Object.keys(contributions)),
        new Set(Object.keys(consensualities)),
      )
    ) {
      throw new Error('contributions and consensualities have a role mismatch');
    }

    if (
      !setEquals(
        new Set(Object.keys(consensualities)),
        new Set(Object.keys(agreements)),
      )
    ) {
      throw new Error('consensualities and agreements have a role mismatch');
    }

    const roleMetrics = new RoleMetricCollection(
      Object.keys(contributions).map((roleId) =>
        RoleMetric.create(
          milestone.project,
          RoleId.from(roleId),
          reviewTopic.id,
          milestone.id,
          contributions[roleId],
          consensualities[roleId],
          agreements[roleId],
        ),
      ),
    );

    return { roleMetrics };

    function setEquals<T>(a: Set<T>, b: Set<T>): boolean {
      return (
        a.size === b.size && Array.from(a.keys()).every((item) => b.has(item))
      );
    }
  }
}
