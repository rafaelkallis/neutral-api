import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';

export class ContributionDto extends ModelDto {
  @ApiProperty({ type: String, example: '507f1f77bcf86cd799439011' })
  public roleId: string;

  @ApiProperty({ type: String, example: '507f1f77bcf86cd799439011' })
  public reviewTopicId: string;

  @ApiProperty({ type: Number, example: 0.4 })
  public amount: number;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    roleId: string,
    reviewTopicId: string,
    amount: number,
  ) {
    super(id, createdAt, updatedAt);
    this.roleId = roleId;
    this.reviewTopicId = reviewTopicId;
    this.amount = amount;
  }
}
