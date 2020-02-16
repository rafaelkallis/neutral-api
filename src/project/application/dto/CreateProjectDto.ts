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
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the project',
  })
  public description: string;

  @IsEnum(ContributionVisibilityValue)
  @IsOptional()
  @ApiProperty({
    example: ContributionVisibilityValue.SELF,
    required: false,
    description: 'contributions visibility level',
  })
  public contributionVisibility?: ContributionVisibilityValue;

  @IsEnum(SkipManagerReviewValue)
  @IsOptional()
  @ApiProperty({
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
