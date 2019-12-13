import { ApiModelProperty } from '@nestjs/swagger';
import { BaseDto } from 'common';
import { PeerReviewEntity } from 'role';

/**
 * Peer Review DTO
 */
export class PeerReviewDto extends BaseDto {
  @ApiModelProperty()
  public reviewerRoleId: string;

  @ApiModelProperty()
  public revieweeRoleId: string;

  @ApiModelProperty()
  public score: number;

  public constructor(
    id: string,
    reviewerRoleId: string,
    revieweeRoleId: string,
    score: number,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.reviewerRoleId = reviewerRoleId;
    this.revieweeRoleId = revieweeRoleId;
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
      peerReview.reviewerRoleId,
      peerReview.revieweeRoleId,
      peerReview.score,
      peerReview.createdAt,
      peerReview.updatedAt,
    );
  }

  public constructor(peerReview: PeerReviewEntity) {
    this.peerReview = peerReview;
  }
}
