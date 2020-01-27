import { ApiProperty } from '@nestjs/swagger';
import { IsPeerReviews } from 'common';

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
  public peerReviews: Record<string, number>;

  public constructor(peerReviews: Record<string, number>) {
    this.peerReviews = peerReviews;
  }
}
