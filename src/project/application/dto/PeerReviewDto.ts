import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';
import { PeerReviewFlag } from 'project/domain/peer-review/value-objects/PeerReviewFlag';

/**
 * Peer Review DTO
 */
export class PeerReviewDto extends ModelDto {
  @ApiProperty({ type: String, example: '507f1f77bcf86cd799439011' })
  public senderRoleId: string;

  @ApiProperty({ type: String, example: '507f1f77bcf86cd799439011' })
  public receiverRoleId: string;

  @ApiProperty({ type: String, example: '507f1f77bcf86cd799439011' })
  public milestoneId: string;

  @ApiProperty({ type: String, example: '507f1f77bcf86cd799439011' })
  public reviewTopicId: string;

  @ApiProperty({ type: Number, example: 27.93 })
  public score: number;

  @ApiProperty({ type: Number, example: 0.4 })
  public normalizedScore: number;

  @ApiProperty({
    type: String,
    enum: PeerReviewFlag,
    example: PeerReviewFlag.ASBENT,
  })
  public flag: PeerReviewFlag;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    senderRoleId: string,
    receiverRoleId: string,
    milestoneId: string,
    reviewTopicId: string,
    score: number,
    normalizedScore: number,
    flag: PeerReviewFlag,
  ) {
    super(id, createdAt, updatedAt);
    this.senderRoleId = senderRoleId;
    this.receiverRoleId = receiverRoleId;
    this.milestoneId = milestoneId;
    this.reviewTopicId = reviewTopicId;
    this.score = score;
    this.normalizedScore = normalizedScore;
    this.flag = flag;
  }
}
