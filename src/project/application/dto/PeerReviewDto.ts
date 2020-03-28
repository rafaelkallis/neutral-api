import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'shared/application/dto/BaseDto';

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
