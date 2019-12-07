import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ContributionVisibility } from '../../common';

interface CreateProjectDtoOptions {
  title: string;
  description: string;
  contributionVisibility?: ContributionVisibility;
}

/**
 * Create project DTO
 */
export class CreateProjectDto {
  @IsString()
  @ApiModelProperty({
    example: 'Mars Shuttle',
    description: 'Title of the project',
  })
  public title!: string;

  @IsString()
  @ApiModelProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the project',
  })
  public description!: string;

  @IsEnum(ContributionVisibility)
  @IsOptional()
  @ApiModelProperty({
    example: ContributionVisibility.SELF,
    required: false,
    description: 'contributions visibility level',
  })
  public contributionVisibility?: ContributionVisibility;

  private constructor() {}

  public static from({
    title,
    description,
    contributionVisibility,
  }: CreateProjectDtoOptions): CreateProjectDto {
    const dto = new CreateProjectDto();
    dto.title = title;
    dto.description = description;
    dto.contributionVisibility = contributionVisibility;
    return dto;
  }
}
