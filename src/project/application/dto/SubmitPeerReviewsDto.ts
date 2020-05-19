import { ApiProperty } from '@nestjs/swagger';
import { IsPeerReviews } from 'shared/validation/is-peer-reviews';
import { IsString } from 'class-validator';

/**
 * Submit peer reviews DTO
 */
export class SubmitPeerReviewsDto {
  @IsPeerReviews()
  @ApiProperty({
    type: Object,
    example: { 'role1-id': 0.5, 'role3-id': 0.2, 'role4-id': 0.3 },
    description: 'Peer reviews',
  })
  public peerReviews: Record<string, number>;

  @IsString()
  @ApiProperty({
    type: String,
    example: '507f1f77bcf86cd799439011',
    description: 'The review topic the peer reviews are applied to',
  })
  public reviewTopicId: string;

  public constructor(
    peerReviews: Record<string, number>,
    reviewTopicId: string,
  ) {
    this.peerReviews = peerReviews;
    this.reviewTopicId = reviewTopicId;
  }
}
