import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';

/**
 * Computes a project's consensuality.
 */
export abstract class ConsensualityComputer {
  /**
   * Computes a project's consensuality.
   */
  public abstract compute(peerReviews: PeerReviewCollection): Consensuality;
}
