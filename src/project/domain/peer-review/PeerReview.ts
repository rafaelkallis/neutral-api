import { Model, ReadonlyModel } from 'shared/domain/Model';
import { Role } from 'project/domain/role/Role';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { SelfPeerReviewException } from 'project/domain/exceptions/SelfPeerReviewException';
import { PeerReviewId } from 'project/domain/peer-review/value-objects/PeerReviewId';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { Type } from '@nestjs/common';

export interface ReadonlyPeerReview extends ReadonlyModel<PeerReviewId> {
  readonly senderRoleId: RoleId;
  readonly receiverRoleId: RoleId;
  readonly reviewTopicId: ReviewTopicId;
  readonly score: PeerReviewScore;

  isSenderRole(roleOrRoleId: Role | RoleId): boolean;
  isReceiverRole(roleOrRoleId: Role | RoleId): boolean;

  readonly _type: Type<ReadonlyPeerReview>;
}

/**
 * Peer Review
 */
export class PeerReview extends Model<PeerReviewId>
  implements ReadonlyPeerReview {
  public senderRoleId: RoleId;
  public receiverRoleId: RoleId;
  public reviewTopicId: ReviewTopicId;
  public score: PeerReviewScore;

  public constructor(
    id: PeerReviewId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    senderRoleId: RoleId,
    receiverRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
    score: PeerReviewScore,
  ) {
    super(id, createdAt, updatedAt);
    this.senderRoleId = senderRoleId;
    this.receiverRoleId = receiverRoleId;
    this.reviewTopicId = reviewTopicId;
    this.score = score;
    this._type = PeerReview;
    this.assertNoSelfReview();
  }

  public static from(
    senderRoleId: RoleId,
    receiverRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
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
      reviewTopicId,
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

  public readonly _type: Type<PeerReview>;
}
