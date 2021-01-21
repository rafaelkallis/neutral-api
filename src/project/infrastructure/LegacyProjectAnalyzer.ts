import {
  ProjectAnalyzer,
  ReviewTopicAnalysisResult,
} from 'project/domain/ProjectAnalyzer';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { Injectable } from '@nestjs/common';
import { ReadonlyMilestone } from 'project/domain/milestone/Milestone';

@Injectable()
export class LegacyProjectAnalyzer extends ProjectAnalyzer {
  private readonly contributionComputer: ContributionsComputer;
  private readonly consensualityComputer: ConsensualityComputer;

  public constructor(
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ) {
    super();
    this.contributionComputer = contributionsComputer;
    this.consensualityComputer = consensualityComputer;
  }

  protected async doAnalyze(
    milestone: ReadonlyMilestone,
    reviewTopic: ReadonlyReviewTopic,
  ): Promise<ReviewTopicAnalysisResult> {
    const contributions = this.contributionComputer
      .compute(milestone)
      .whereReviewTopic(reviewTopic);
    const consensuality = this.consensualityComputer
      .compute(milestone)
      .ofReviewTopic(reviewTopic.id);
    return Promise.resolve({ contributions, consensuality });
  }
}
