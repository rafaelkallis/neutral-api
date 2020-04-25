import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { SkipManagerReviewValue } from 'project/domain/value-objects/SkipManagerReview';
import { ContributionVisibilityValue } from 'project/domain/value-objects/ContributionVisibility';

/**
 * Create project DTO
 */
export class CreateProjectDto {
  @IsString()
  @ApiProperty({
    example: 'Mars Shuttle',
    description: 'Title of the project',
  })
  public title: string;

  @IsString()
  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui.',
    description: 'Description of the project',
  })
  public description: string;

  @IsEnum(ContributionVisibilityValue)
  @IsOptional()
  @ApiProperty({
    enum: ContributionVisibilityValue,
    example: ContributionVisibilityValue.SELF,
    required: false,
    description: 'contributions visibility level',
  })
  public contributionVisibility?: ContributionVisibilityValue;

  @IsEnum(SkipManagerReviewValue)
  @IsOptional()
  @ApiProperty({
    enum: SkipManagerReviewValue,
    example: SkipManagerReviewValue.IF_CONSENSUAL,
    required: false,
    description: 'option to skip manager review',
  })
  public skipManagerReview?: SkipManagerReviewValue;

  public constructor(
    title: string,
    description: string,
    contributionVisibility?: ContributionVisibilityValue,
    skipManagerReview?: SkipManagerReviewValue,
  ) {
    this.title = title;
    this.description = description;
    this.contributionVisibility = contributionVisibility;
    this.skipManagerReview = skipManagerReview;
  }
}
