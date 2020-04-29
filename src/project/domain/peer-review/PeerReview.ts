import { Model, ReadonlyModel } from 'shared/domain/Model';
import { Role } from 'project/domain/role/Role';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { SelfPeerReviewException } from 'project/domain/exceptions/SelfPeerReviewException';
import { PeerReviewId } from 'project/domain/peer-review/value-objects/PeerReviewId';
import { RoleId } from 'project/domain/role/value-objects/RoleId';

export interface ReadonlyPeerReview extends ReadonlyModel<PeerReviewId> {
  readonly senderRoleId: RoleId;
  readonly receiverRoleId: RoleId;
  readonly score: PeerReviewScore;

  isSenderRole(roleOrRoleId: Role | RoleId): boolean;
  isReceiverRole(roleOrRoleId: Role | RoleId): boolean;
}

/**
 * Peer Review
 */
export class PeerReview extends Model<PeerReviewId>
  implements ReadonlyPeerReview {
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
