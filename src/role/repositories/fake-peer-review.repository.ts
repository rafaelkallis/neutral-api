import { PeerReviewModel } from 'role/peer-review.model';
import { FakeRepository } from 'common';
import { PeerReviewRepository } from 'role/repositories/peer-review.repository';
import { PeerReviewNotFoundException } from 'role/exceptions/peer-review-not-found.exception';

/**
 * Fake Peer Review Repository
 */
export class FakePeerReviewRepository extends FakeRepository<PeerReviewModel>
  implements PeerReviewRepository {
  /**
   *
   */
  public async findBySenderRoleId(
    senderRoleId: string,
  ): Promise<PeerReviewModel[]> {
    return Array.from(this.entities.values()).filter(
      peerReview => peerReview.senderRoleId === senderRoleId,
    );
  }

  /**
   *
   */
  public async findByReceiverRoleId(
    receiverRoleId: string,
  ): Promise<PeerReviewModel[]> {
    return Array.from(this.entities.values()).filter(
      peerReview => peerReview.receiverRoleId === receiverRoleId,
    );
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new PeerReviewNotFoundException();
  }
}
