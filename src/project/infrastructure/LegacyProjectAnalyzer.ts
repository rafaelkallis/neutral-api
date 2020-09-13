import {
  ProjectAnalyzer,
  ReviewTopicAnalysisResult,
} from 'project/domain/ProjectAnalyzer';
import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReadonlyProject } from 'project/domain/project/Project';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { Injectable } from '@nestjs/common';

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

  protected async analyzeReviewTopic(
    _peerReviews: ReadonlyPeerReviewCollection,
    reviewTopic: ReadonlyReviewTopic,
    project: ReadonlyProject,
  ): Promise<ReviewTopicAnalysisResult> {
    const contributions = this.contributionComputer
      .compute(project)
      .whereReviewTopic(reviewTopic);
    const consensuality = this.consensualityComputer
      .compute(project)
      .ofReviewTopic(reviewTopic.id);
    return Promise.resolve({ contributions, consensuality });
  }
}
