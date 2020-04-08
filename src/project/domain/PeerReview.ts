import { Model } from 'shared/domain/Model';
import { Role } from 'project/domain/Role';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { SelfPeerReviewException } from 'project/domain/exceptions/SelfPeerReviewException';
import { PeerReviewId } from 'project/domain/value-objects/PeerReviewId';
import { RoleId } from 'project/domain/value-objects/RoleId';

/**
 * Peer Review
 */
export class PeerReview extends Model<PeerReviewId> {
  public senderRoleId: RoleId;
  public receiverRoleId: RoleId;
  public score: PeerReviewScore;

  public constructor(
    id: PeerReviewId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    senderRoleId: RoleId,
    receiverRoleId: RoleId,
    score: PeerReviewScore,
  ) {
    super(id, createdAt, updatedAt);
    this.senderRoleId = senderRoleId;
    this.receiverRoleId = receiverRoleId;
    this.score = score;
    this.assertNoSelfReview();
  }

  public static from(
    senderRoleId: RoleId,
    receiverRoleId: RoleId,
    score: PeerReviewScore,
  ): PeerReview {
    const peerReviewId = PeerReviewId.create();
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

  public isSenderRole(roleOrRoleId: Role | RoleId): boolean {
    const roleId =
      roleOrRoleId instanceof Role ? roleOrRoleId.id : roleOrRoleId;
    return this.senderRoleId.equals(roleId);
  }

  public isReceiverRole(roleOrRoleId: Role | RoleId): boolean {
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
