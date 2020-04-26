import { Contribution } from 'project/domain/value-objects/Contribution';
import { ReadonlyPeerReviewCollection } from 'project/domain/PeerReviewCollection';
import { RoleId } from 'project/domain/value-objects/RoleId';

/**
 *
 */
export interface Contributions {
  of(roleId: RoleId): Contribution;
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
