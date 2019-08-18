import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

interface CreateProjectDtoOptions {
  title: string;
  description: string;
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

  private constructor() {}

  public static from({
    title,
    description,
  }: CreateProjectDtoOptions): CreateProjectDto {
    const dto = new CreateProjectDto();
    dto.title = title;
    dto.description = description;
    return dto;
  }
}
