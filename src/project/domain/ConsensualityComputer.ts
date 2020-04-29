import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';

/**
 * Computes a project's consensuality.
 */
export abstract class ConsensualityComputer {
  /**
   * Computes a project's consensuality.
   */
  public abstract compute(
    peerReviews: ReadonlyPeerReviewCollection,
  ): Consensuality;
}
