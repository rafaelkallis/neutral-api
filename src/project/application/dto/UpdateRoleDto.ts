import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Update role DTO
 */
export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Lead Hacker',
    description: 'Title of the role',
    required: false,
  })
  public title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the role',
    required: false,
  })
  public description?: string;

  public constructor(title?: string, description?: string) {
    this.title = title;
    this.description = description;
  }
}
