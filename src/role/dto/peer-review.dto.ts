import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common';
import { PeerReviewEntity } from 'role/entities/peer-review.entity';

/**
 * Peer Review DTO
 */
export class PeerReviewDto extends BaseDto {
  @ApiProperty()
  public senderRoleId: string | null;

  @ApiProperty()
  public receiverRoleId: string | null;

  @ApiProperty()
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

interface BuildStep {
  build(): PeerReviewDto;
}

/**
 * Peer Review DTO Builder
 */
export class PeerReviewDtoBuilder implements BuildStep {
  private readonly peerReview: PeerReviewEntity;

  private constructor(peerReview: PeerReviewEntity) {
    this.peerReview = peerReview;
  }

  public static of(peerReview: PeerReviewEntity): BuildStep {
    return new PeerReviewDtoBuilder(peerReview);
  }

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
}
