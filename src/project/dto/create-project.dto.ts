import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import {
  ContributionVisibility,
  PeerReviewVisibility,
  SkipManagerReview,
} from 'project/entities/project.entity';

interface CreateProjectDtoOptions {
  title: string;
  description: string;
  contributionVisibility?: ContributionVisibility;
  peerReviewVisibility?: PeerReviewVisibility;
  skipManagerReview?: SkipManagerReview;
}

/**
 * Create project DTO
 */
export class CreateProjectDto {
  @IsString()
  @ApiProperty({
    example: 'Mars Shuttle',
    description: 'Title of the project',
  })
  public title!: string;

  @IsString()
  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the project',
  })
  public description!: string;

  @IsEnum(ContributionVisibility)
  @IsOptional()
  @ApiProperty({
    example: ContributionVisibility.SELF,
    required: false,
    description: 'contributions visibility level',
  })
  public contributionVisibility?: ContributionVisibility;

  @IsEnum(PeerReviewVisibility)
  @IsOptional()
  @ApiProperty({
    example: PeerReviewVisibility.SENT,
    required: false,
    description: 'peer review visibility level',
  })
  public peerReviewVisibility?: PeerReviewVisibility;

  @IsEnum(SkipManagerReview)
  @IsOptional()
  @ApiProperty({
    example: SkipManagerReview.IF_CONSENSUAL,
    required: false,
    description: 'option to skip manager review',
  })
  public skipManagerReview?: SkipManagerReview;

  private constructor() {}

  public static from({
    title,
    description,
    contributionVisibility,
    peerReviewVisibility,
    skipManagerReview,
  }: CreateProjectDtoOptions): CreateProjectDto {
    const dto = new CreateProjectDto();
    dto.title = title;
    dto.description = description;
    dto.contributionVisibility = contributionVisibility;
    dto.peerReviewVisibility = peerReviewVisibility;
    dto.skipManagerReview = skipManagerReview;
    return dto;
  }
}
