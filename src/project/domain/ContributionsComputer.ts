import { Contribution } from 'project/domain/value-objects/Contribution';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';
import { Id } from 'shared/domain/value-objects/Id';

/**
 *
 */
export interface Contributions {
  of(roleId: Id): Contribution;
}

/**
 * Contributions Computer
 */
export abstract class ContributionsComputer {
  /**
   * Computes the relative contributions.
   */
  public abstract compute(peerReviews: PeerReviewCollection): Contributions;
}
