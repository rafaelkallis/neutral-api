import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';

export class RoleMetricDto extends ModelDto {
  @ApiProperty({ type: String, example: '507f1f77bcf86cd799439011' })
  public milestoneId: string;

  @ApiProperty({ type: String, example: '507f1f77bcf86cd799439011' })
  public reviewTopicId: string;

  @ApiProperty({ type: String, example: '507f1f77bcf86cd799439011' })
  public roleId: string;

  @ApiProperty({ type: Number, example: 0.4 })
  public contribution: number;

  @ApiProperty({ type: Number, example: 0.4 })
  public consensuality: number;

  @ApiProperty({ type: Number, example: 0.4 })
  public agreement: number;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    milestoneId: string,
    reviewTopicId: string,
    roleId: string,
    contribution: number,
    consensuality: number,
    agreement: number,
  ) {
    super(id, createdAt, updatedAt);
    this.milestoneId = milestoneId;
    this.reviewTopicId = reviewTopicId;
    this.roleId = roleId;
    this.contribution = contribution;
    this.consensuality = consensuality;
    this.agreement = agreement;
  }
}
