import { ApiProperty } from '@nestjs/swagger';
import { IsPeerReviews } from '../../common';

interface SubmitPeerReviewsDtoOptions {
  peerReviews: Record<string, number>;
}

/**
 * Submit peer reviews DTO
 */
export class SubmitPeerReviewsDto {
  @IsPeerReviews()
  @ApiProperty({
    example: `
    {
      "role1-id": 0.5,
      "role3-id": 0.2,
      "role4-id": 0.3
    }
    `,
    description: 'Peer reviews',
  })
  public peerReviews!: Record<string, number>;

  private constructor() {}

  public static from({
    peerReviews,
  }: SubmitPeerReviewsDtoOptions): SubmitPeerReviewsDto {
    const dto = new SubmitPeerReviewsDto();
    dto.peerReviews = peerReviews;
    return dto;
  }
}
