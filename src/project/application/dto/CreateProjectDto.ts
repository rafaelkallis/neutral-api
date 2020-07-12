import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsObject, IsOptional } from 'class-validator';
import { SkipManagerReviewValue } from 'project/domain/project/value-objects/SkipManagerReview';
import { ContributionVisibilityValue } from 'project/domain/project/value-objects/ContributionVisibility';

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

  @IsObject()
  @IsOptional()
  @ApiProperty({
    type: Object,
    example: { custom1: 'foo', custom2: {} },
    description: 'Arbitrary project metadata',
    required: false,
  })
  public meta?: Record<string, unknown>;

  @IsEnum(ContributionVisibilityValue)
  @ApiProperty({
    enum: ContributionVisibilityValue,
    example: ContributionVisibilityValue.SELF,
    description: 'contributions visibility level',
  })
  public contributionVisibility: ContributionVisibilityValue;

  @IsEnum(SkipManagerReviewValue)
  @ApiProperty({
    enum: SkipManagerReviewValue,
    example: SkipManagerReviewValue.IF_CONSENSUAL,
    description: 'option to skip manager review',
  })
  public skipManagerReview: SkipManagerReviewValue;

  public constructor(
    title: string,
    description: string,
    meta: Record<string, unknown> | undefined,
    contributionVisibility: ContributionVisibilityValue,
    skipManagerReview: SkipManagerReviewValue,
  ) {
    this.title = title;
    this.description = description;
    this.meta = meta;
    this.contributionVisibility = contributionVisibility;
    this.skipManagerReview = skipManagerReview;
  }
}
