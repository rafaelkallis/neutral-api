import { ApiModelProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

interface PatchRoleDtoOptions {
  assigneeId?: string | null;
  title?: string;
  description?: string;
}

/**
 * Patch role DTO
 */
export class PatchRoleDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty({
    description: 'The assignee of the role',
    required: false,
  })
  public assigneeId?: string | null;

  @IsString()
  @IsOptional()
  @ApiModelProperty({
    example: 'Lead Hacker',
    description: 'Title of the role',
    required: false,
  })
  public title?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the role',
    required: false,
  })
  public description?: string;

  private constructor() {}

  public static from({
    assigneeId,
    title,
    description,
  }: PatchRoleDtoOptions): PatchRoleDto {
    const dto = new PatchRoleDto();
    dto.assigneeId = assigneeId;
    dto.title = title;
    dto.description = description;
    return dto;
  }
}
