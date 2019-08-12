import { ApiModelProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Patch project DTO
 */
export class PatchProjectDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty({
    example: 'Mars Shuttle',
    description: 'Title of the project',
    required: false,
  })
  public title?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the project',
    required: false,
  })
  public description?: string;
}
