import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'shared/application/dto/BaseDto';

/**
 * Role DTO
 */
export class RoleDto extends BaseDto {
  @ApiProperty()
  public projectId: string;

  @ApiProperty({ required: false })
  public assigneeId: string | null;

  @ApiProperty()
  public title: string;

  @ApiProperty()
  public description: string;

  @ApiProperty({ required: false })
  public contribution: number | null;

  @ApiProperty({
    required: false,
    description:
      'Specifies whether or not the assigned user has submitted peer reviews. Only visible to the project manager and the assignee.',
  })
  public hasSubmittedPeerReviews: boolean | null;

  public constructor(
    id: string,
    projectId: string,
    assigneeId: string | null,
    title: string,
    description: string,
    contribution: number | null,
    hasSubmittedPeerReviews: boolean | null,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
    this.contribution = contribution;
    this.hasSubmittedPeerReviews = hasSubmittedPeerReviews;
  }
}
