import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';
import { IsString, IsBoolean } from 'class-validator';

/**
 * Role DTO
 */
export class RoleDto extends ModelDto {
  @ApiProperty()
  public projectId: string;

  @ApiProperty({ type: String, required: false })
  public assigneeId: string | null;

  @IsString()
  @ApiProperty({
    type: String,
    example: 'Lead Hacker',
    description: 'Title of the role',
  })
  public title: string;

  @IsString()
  @ApiProperty({
    type: String,
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the role',
  })
  public description: string;

  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    example: true,
    description:
      'Only visible for manager during peer-review state, determines whether or not the role has submitted peer reviews',
    required: false,
  })
  public hasSubmittedPeerReviews?: boolean;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    projectId: string,
    assigneeId: string | null,
    title: string,
    description: string,
    hasSubmittedPeerReviews: boolean | undefined,
  ) {
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
    this.hasSubmittedPeerReviews = hasSubmittedPeerReviews;
  }
}
