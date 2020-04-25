import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';

/**
 * Peer Review DTO
 */
export class PeerReviewDto extends ModelDto {
  @ApiProperty({ type: String, example: '507f1f77bcf86cd799439011' })
  public senderRoleId: string;

  @ApiProperty({ type: String, example: '507f1f77bcf86cd799439011' })
  public receiverRoleId: string;

  @ApiProperty({ type: Number, example: 0.4 })
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
