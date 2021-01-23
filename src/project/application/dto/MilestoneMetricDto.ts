import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';

export class MilestoneMetricDto extends ModelDto {
  @ApiProperty({ type: String, example: '507f1f77bcf86cd799439011' })
  public milestoneId: string;

  @ApiProperty({ type: String, example: '507f1f77bcf86cd799439011' })
  public reviewTopicId: string;

  @ApiProperty({ type: Number, example: 0.4 })
  public contributionSymmetry: number;

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
    contributionSymmetry: number,
    consensuality: number,
    agreement: number,
  ) {
    super(id, createdAt, updatedAt);
    this.milestoneId = milestoneId;
    this.reviewTopicId = reviewTopicId;
    this.contributionSymmetry = contributionSymmetry;
    this.consensuality = consensuality;
    this.agreement = agreement;
  }
}
