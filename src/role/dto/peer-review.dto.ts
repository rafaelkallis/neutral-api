import { ApiModelProperty } from '@nestjs/swagger';
import { BaseDto } from 'common';
import { PeerReviewEntity } from 'role/entities/peer-review.entity';
import { RoleEntity } from 'role/entities/role.entity';
import { ProjectEntity, PeerReviewVisibility } from 'project';
import { UserEntity } from 'user';

/**
 * Peer Review DTO
 */
export class PeerReviewDto extends BaseDto {
  @ApiModelProperty()
  public senderRoleId: string | null;

  @ApiModelProperty()
  public receiverRoleId: string | null;

  @ApiModelProperty()
  public score: number | null;

  public constructor(
    id: string,
    senderRoleId: string | null,
    receiverRoleId: string | null,
    score: number | null,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.senderRoleId = senderRoleId;
    this.receiverRoleId = receiverRoleId;
    this.score = score;
  }
}

/**
 * Peer Review DTO Builder
 */
export class PeerReviewDtoBuilder {
  private readonly peerReview: PeerReviewEntity;
  private readonly role: RoleEntity;
  private readonly project: ProjectEntity;
  private readonly authUser: UserEntity;

  public constructor(
    peerReview: PeerReviewEntity,
    role: RoleEntity,
    project: ProjectEntity,
    authUser: UserEntity,
  ) {
    this.peerReview = peerReview;
    this.role = role;
    this.project = project;
    this.authUser = authUser;
  }

  public build(): PeerReviewDto {
    const { peerReview } = this;
    return new PeerReviewDto(
      peerReview.id,
      this.shouldExposeSenderRoleId() ? peerReview.senderRoleId : null,
      this.shouldExposeReceiverRoleId() ? peerReview.receiverRoleId : null,
      this.shouldExposeScore() ? peerReview.score : null,
      peerReview.createdAt,
      peerReview.updatedAt,
    );
  }

  private shouldExposeSenderRoleId(): boolean {
    const { peerReview, role, project, authUser } = this;
    if (project.isOwner(authUser)) {
      return true;
    }
    if (!role.isAssignee(authUser)) {
      return false;
    }
    if (peerReview.isSenderRole(role)) {
      return true;
    }
    if (peerReview.isReceiverRole(role)) {
      if (!project.isFinishedState()) {
        return false;
      }
      return (
        PeerReviewVisibility.SENT_RECEIVED === project.peerReviewVisibility
      );
    }
    return false;
  }

  private shouldExposeReceiverRoleId(): boolean {
    const { peerReview, role, project, authUser } = this;
    if (project.isOwner(authUser)) {
      return true;
    }
    if (!role.isAssignee(authUser)) {
      return false;
    }
    if (peerReview.isSenderRole(role)) {
      return true;
    }
    if (peerReview.isReceiverRole(role)) {
      return true;
    }
    return false;
  }

  private shouldExposeScore(): boolean {
    const { peerReview, role, project, authUser } = this;
    if (project.isOwner(authUser)) {
      return true;
    }
    if (!role.isAssignee(authUser)) {
      return false;
    }
    if (peerReview.isSenderRole(role)) {
      return true;
    }
    if (peerReview.isReceiverRole(role)) {
      if (!project.isFinishedState()) {
        return false;
      }
      if (PeerReviewVisibility.SENT_RECEIVED === project.peerReviewVisibility) {
        return true;
      }
      if (
        PeerReviewVisibility.SENT_RECEIVEDSCORES ===
        project.peerReviewVisibility
      ) {
        return true;
      }
      return false;
    }
    return false;
  }
}
