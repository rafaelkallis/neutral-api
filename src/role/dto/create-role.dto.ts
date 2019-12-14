import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

interface CreateRoleDtoOptions {
  projectId: string;
  assigneeId?: string | null;
  title: string;
  description: string;
}

/**
 * Create role DTO
 */
export class CreateRoleDto {
  @IsString()
  @ApiProperty({
    description: 'Id of the project the role belongs to',
  })
  public projectId!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Id of the role assignee',
    required: false,
    example: null,
  })
  public assigneeId?: string | null;

  @IsString()
  @ApiProperty({
    example: 'Lead Hacker',
    description: 'Title of the role',
  })
  public title!: string;

  @IsString()
  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the role',
  })
  public description!: string;

  private constructor() {}

  public static from({
    projectId,
    assigneeId,
    title,
    description,
  }: CreateRoleDtoOptions): CreateRoleDto {
    const dto = new CreateRoleDto();
    dto.projectId = projectId;
    dto.assigneeId = assigneeId;
    dto.title = title;
    dto.description = description;
    return dto;
  }
}
