import { PeerReviewEntity } from 'role/entities/peer-review.entity';
import { FakeRepository } from 'common';
import { PeerReviewRepository } from 'role/repositories/peer-review.repository';

/**
 * Fake Peer Review Repository
 */
export class FakePeerReviewRepository extends FakeRepository<PeerReviewEntity>
  implements PeerReviewRepository {
  /**
   *
   */
  public async findBySenderRoleId(
    senderRoleId: string,
  ): Promise<PeerReviewEntity[]> {
    return Array.from(this.entities.values()).filter(
      peerReview => peerReview.senderRoleId === senderRoleId,
    );
  }

  /**
   *
   */
  public async findByReceiverRoleId(
    receiverRoleId: string,
  ): Promise<PeerReviewEntity[]> {
    return Array.from(this.entities.values()).filter(
      peerReview => peerReview.receiverRoleId === receiverRoleId,
    );
  }
}
