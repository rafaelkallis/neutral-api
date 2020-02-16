import { PeerReviewModel } from 'role/domain/PeerReviewModel';
import { PeerReviewRepository } from 'role/domain/PeerReviewRepository';
import { PeerReviewNotFoundException } from 'project/domain/exceptions/PeerReviewNotFoundException';
import { MemoryRepository } from 'common/infrastructure/MemoryRepository';
import { Id } from 'common/domain/value-objects/Id';

/**
 * Fake Peer Review Repository
 */
export class FakePeerReviewRepository extends MemoryRepository<PeerReviewModel>
  implements PeerReviewRepository {
  /**
   *
   */
  public async findBySenderRoleId(
    senderRoleId: Id,
  ): Promise<PeerReviewModel[]> {
    return Array.from(this.models.values()).filter(peerReview =>
      peerReview.senderRoleId.equals(senderRoleId),
    );
  }

  /**
   *
   */
  public async findByReceiverRoleId(
    receiverRoleId: Id,
  ): Promise<PeerReviewModel[]> {
    return Array.from(this.models.values()).filter(peerReview =>
      peerReview.receiverRoleId.equals(receiverRoleId),
    );
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new PeerReviewNotFoundException();
  }
}
