import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ContributionCollection } from 'project/domain/contribution/ContributionCollection';

/**
 * Contributions Computer
 */
export abstract class ContributionsComputer {
  /**
   * Computes the relative contributions.
   */
  public abstract compute(
    peerReviews: ReadonlyPeerReviewCollection,
  ): ContributionCollection;
}
