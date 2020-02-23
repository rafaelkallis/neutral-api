import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common/application/dto/BaseDto';
import { PeerReview } from 'project/domain/PeerReview';

/**
 * Peer Review DTO
 */
export class PeerReviewDto extends BaseDto {
  @ApiProperty({ required: false })
  public senderRoleId: string | null;

  @ApiProperty({ required: false })
  public receiverRoleId: string | null;

  @ApiProperty({ required: false })
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
  private readonly peerReview: PeerReview;

  private constructor(peerReview: PeerReview) {
    this.peerReview = peerReview;
  }

  public static of(peerReview: PeerReview): BuildStep {
    return new PeerReviewDtoBuilder(peerReview);
  }

  public build(): PeerReviewDto {
    const { peerReview } = this;
    return new PeerReviewDto(
      peerReview.id.value,
      peerReview.senderRoleId.value,
      peerReview.receiverRoleId.value,
      peerReview.score.value,
      peerReview.createdAt.value,
      peerReview.updatedAt.value,
    );
  }
}
