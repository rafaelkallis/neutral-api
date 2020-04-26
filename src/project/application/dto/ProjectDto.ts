import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';
import { RoleDto } from 'project/application/dto/RoleDto';
import { SkipManagerReviewValue } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectStateValue } from 'project/domain/value-objects/states/ProjectStateValue';
import { ContributionVisibilityValue } from 'project/domain/value-objects/ContributionVisibility';
import { PeerReviewDto } from 'project/application/dto/PeerReviewDto';

/**
 * Project DTO
 */
export class ProjectDto extends ModelDto {
  @ApiProperty({
    example: 'Mars Shuttle',
    description: 'Title of the project',
  })
  public title: string;

  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui.',
    description: 'Description of the project',
  })
  public description: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  public creatorId: string;

  @ApiProperty({
    enum: ProjectStateValue,
    example: ProjectStateValue.FORMATION,
  })
  public state: ProjectStateValue;

  @ApiProperty({ type: Number, required: false, example: 0.5 })
  public consensuality: number | null;

  @ApiProperty({
    enum: ContributionVisibilityValue,
    example: ContributionVisibilityValue.SELF,
  })
  public contributionVisibility: ContributionVisibilityValue;

  @ApiProperty({
    enum: SkipManagerReviewValue,
    example: SkipManagerReviewValue.IF_CONSENSUAL,
  })
  public skipManagerReview: SkipManagerReviewValue;

  @ApiProperty({ type: [RoleDto] })
  public roles: RoleDto[];

  @ApiProperty({ type: [PeerReviewDto], required: false })
  public peerReviews: PeerReviewDto[] | null;

  public constructor(
    id: string,
    title: string,
    description: string,
    creatorId: string,
    state: ProjectStateValue,
    consensuality: number | null,
    contributionVisibility: ContributionVisibilityValue,
    skipManagerReview: SkipManagerReviewValue,
    roles: RoleDto[],
    peerReviews: PeerReviewDto[] | null,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.creatorId = creatorId;
    this.state = state;
    this.consensuality = consensuality;
    this.contributionVisibility = contributionVisibility;
    this.skipManagerReview = skipManagerReview;
    this.roles = roles;
    this.peerReviews = peerReviews;
  }
}
