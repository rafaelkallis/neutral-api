import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import {
  ContributionVisibility,
  SkipManagerReview,
} from 'project/domain/ProjectModel';
import { CreateProjectOptions } from 'project/domain/ProjectDomainService';

/**
 * Create project DTO
 */
export class CreateProjectDto implements CreateProjectOptions {
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

  @IsEnum(ContributionVisibility)
  @IsOptional()
  @ApiProperty({
    example: ContributionVisibility.SELF,
    required: false,
    description: 'contributions visibility level',
  })
  public contributionVisibility?: ContributionVisibility;

  @IsEnum(SkipManagerReview)
  @IsOptional()
  @ApiProperty({
    example: SkipManagerReview.IF_CONSENSUAL,
    required: false,
    description: 'option to skip manager review',
  })
  public skipManagerReview?: SkipManagerReview;

  public constructor(
    title: string,
    description: string,
    contributionVisibility?: ContributionVisibility,
    skipManagerReview?: SkipManagerReview,
  ) {
    this.title = title;
    this.description = description;
    this.contributionVisibility = contributionVisibility;
    this.skipManagerReview = skipManagerReview;
  }
}
