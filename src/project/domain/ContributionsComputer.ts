import { Inject } from '@nestjs/common';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';

export const CONTRIBUTIONS_COMPUTER = Symbol('CONTRIBUTIONS_COMPUTER');

export function InjectContributionsComputer(): ParameterDecorator {
  return Inject(CONTRIBUTIONS_COMPUTER);
}

/**
 * Contributions Computer
 */
export interface ContributionsComputer {
  /**
   * Computes the relative contributions.
   */
  compute(peerReviews: PeerReviewCollection): Record<string, Contribution>;
}
