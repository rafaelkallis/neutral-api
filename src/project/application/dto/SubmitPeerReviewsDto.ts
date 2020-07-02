import { ApiProperty } from '@nestjs/swagger';
import { IsPeerReviews } from 'shared/validation/is-peer-reviews';
import { IsString } from 'class-validator';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

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

  public asPeerReviewCollection(senderRoleId: RoleId): PeerReviewCollection {
    return new PeerReviewCollection(
      Object.entries(this.peerReviews).map(([receiverRoleId, score]) =>
        PeerReview.from(
          senderRoleId,
          RoleId.from(receiverRoleId),
          ReviewTopicId.from(this.reviewTopicId),
          PeerReviewScore.from(score),
        ),
      ),
    );
  }
}
