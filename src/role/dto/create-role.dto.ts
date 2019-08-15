import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

/**
 * Create role DTO
 */
export class CreateRoleDto {
  @IsString()
  @ApiModelProperty({
    description: 'Id of the project the role belongs to',
  })
  public projectId!: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty({
    description: 'Id of the role assignee',
    required: false,
  })
  public assigneeId?: string | null;

  @IsString()
  @ApiModelProperty({
    example: 'Lead Hacker',
    description: 'Title of the role',
  })
  public title!: string;

  @IsString()
  @ApiModelProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the role',
  })
  public description!: string;
}
