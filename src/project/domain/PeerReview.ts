import { Model } from 'common/domain/Model';
import { Role } from 'project/domain/Role';
import { Id } from 'common/domain/value-objects/Id';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { SelfPeerReviewException } from 'project/domain/exceptions/SelfPeerReviewException';

/**
 * Peer Review
 */
export class PeerReview extends Model {
  public senderRoleId: Id;
  public receiverRoleId: Id;
  public score: PeerReviewScore;

  public constructor(
    id: Id,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    senderRoleId: Id,
    receiverRoleId: Id,
    score: PeerReviewScore,
  ) {
    super(id, createdAt, updatedAt);
    this.senderRoleId = senderRoleId;
    this.receiverRoleId = receiverRoleId;
    this.score = score;
    this.assertNoSelfReview();
  }

  public static from(
    senderRoleId: Id,
    receiverRoleId: Id,
    score: PeerReviewScore,
  ): PeerReview {
    const peerReviewId = Id.create();
    const peerReviewCreatedAt = CreatedAt.now();
    const peerReviewUpdatedAt = UpdatedAt.now();
    return new PeerReview(
      peerReviewId,
      peerReviewCreatedAt,
      peerReviewUpdatedAt,
      senderRoleId,
      receiverRoleId,
      score,
    );
  }

  public isSenderRole(roleOrRoleId: Role | Id): boolean {
    const roleId =
      roleOrRoleId instanceof Role ? roleOrRoleId.id : roleOrRoleId;
    return this.senderRoleId.equals(roleId);
  }

  public isReceiverRole(roleOrRoleId: Role | Id): boolean {
    const roleId =
      roleOrRoleId instanceof Role ? roleOrRoleId.id : roleOrRoleId;
    return this.receiverRoleId.equals(roleId);
  }

  protected assertNoSelfReview(): void {
    if (this.senderRoleId.equals(this.receiverRoleId)) {
      throw new SelfPeerReviewException();
    }
  }
}
