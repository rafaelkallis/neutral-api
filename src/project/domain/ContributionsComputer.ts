import { ContributionAmount } from 'project/domain/role/value-objects/ContributionAmount';
import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { RoleId } from 'project/domain/role/value-objects/RoleId';

/**
 *
 */
export interface Contributions {
  of(roleId: RoleId): ContributionAmount;
}

/**
 * Contributions Computer
 */
export abstract class ContributionsComputer {
  /**
   * Computes the relative contributions.
   */
  public abstract compute(
    peerReviews: ReadonlyPeerReviewCollection,
  ): Contributions;
}
