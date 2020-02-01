import { PeerReviewModel } from 'role/peer-review.model';
import { Repository } from 'common';

export const PEER_REVIEW_REPOSITORY = Symbol('PEER_REVIEW_REPOSITORY');

/**
 * Peer Review Repository
 */
export interface PeerReviewRepository extends Repository<PeerReviewModel> {
  /**
   *
   */
  findBySenderRoleId(senderRoleId: string): Promise<PeerReviewModel[]>;

  /**
   *
   */
  findByReceiverRoleId(receiverRoleId: string): Promise<PeerReviewModel[]>;
}
