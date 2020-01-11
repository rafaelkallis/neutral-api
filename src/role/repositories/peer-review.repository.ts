import { PeerReviewEntity } from 'role/entities/peer-review.entity';
import { Repository } from 'common';

export const PEER_REVIEW_REPOSITORY = Symbol('PEER_REVIEW_REPOSITORY');

/**
 * Peer Review Repository
 */
export interface PeerReviewRepository extends Repository<PeerReviewEntity> {
  /**
   *
   */
  findBySenderRoleId(senderRoleId: string): Promise<PeerReviewEntity[]>;

  /**
   *
   */
  findByReceiverRoleId(receiverRoleId: string): Promise<PeerReviewEntity[]>;
}
