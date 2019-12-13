import { ApiModelProperty } from '@nestjs/swagger';
import { BaseDto } from 'common';
import { PeerReviewEntity } from 'role';

/**
 * Peer Review DTO
 */
export class PeerReviewDto extends BaseDto {
  @ApiModelProperty()
  public senderRoleId: string;

  @ApiModelProperty()
  public receiverRoleId: string;

  @ApiModelProperty()
  public score: number;

  public constructor(
    id: string,
    senderRoleId: string,
    receiverRoleId: string,
    score: number,
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

  public build(): PeerReviewDto {
    const { peerReview } = this;
    return new PeerReviewDto(
      peerReview.id,
      peerReview.senderRoleId,
      peerReview.receiverRoleId,
      peerReview.score,
      peerReview.createdAt,
      peerReview.updatedAt,
    );
  }

  public constructor(peerReview: PeerReviewEntity) {
    this.peerReview = peerReview;
  }
}
