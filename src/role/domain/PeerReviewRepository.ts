import { Repository } from 'common/domain/Repository';
import { PeerReviewModel } from 'role/domain/PeerReviewModel';
import { Id } from 'common/domain/value-objects/Id';

export const PEER_REVIEW_REPOSITORY = Symbol('PEER_REVIEW_REPOSITORY');

/**
 * Peer Review Repository
 */
export interface PeerReviewRepository extends Repository<PeerReviewModel> {
  /**
   *
   */
  findBySenderRoleId(senderRoleId: Id): Promise<PeerReviewModel[]>;

  /**
   *
   */
  findByReceiverRoleId(receiverRoleId: Id): Promise<PeerReviewModel[]>;
}
