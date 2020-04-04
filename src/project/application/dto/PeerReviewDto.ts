import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';

/**
 * Peer Review DTO
 */
export class PeerReviewDto extends ModelDto {
  @ApiProperty({
    type: String,
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  public senderRoleId: string | null;

  @ApiProperty({
    type: String,
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  public receiverRoleId: string | null;

  @ApiProperty({ type: Number, required: false, example: 0.4 })
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
