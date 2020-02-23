import { Inject } from '@nestjs/common';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';

export const CONSENSUALITY_COMPUTER = Symbol('CONSENSUALITY_COMPUTER');

export function InjectConsensualityComputer(): ParameterDecorator {
  return Inject(CONSENSUALITY_COMPUTER);
}

/**
 * Computes a project's consensuality.
 */
export interface ConsensualityComputer {
  /**
   * Computes a project's consensuality.
   */
  compute(peerReviews: PeerReviewCollection): Consensuality;
}
