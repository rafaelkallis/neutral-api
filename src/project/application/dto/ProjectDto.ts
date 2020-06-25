import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';
import { RoleDto } from 'project/application/dto/RoleDto';
import { SkipManagerReviewValue } from 'project/domain/project/value-objects/SkipManagerReview';
import { ProjectStateValue } from 'project/domain/project/value-objects/states/ProjectStateValue';
import { ContributionVisibilityValue } from 'project/domain/project/value-objects/ContributionVisibility';
import { PeerReviewDto } from 'project/application/dto/PeerReviewDto';
import { ReviewTopicDto } from './ReviewTopicDto';
import { ContributionDto } from './ContributionDto';

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

  // TODO remove once frontend does not depend on this anymore
  public consensuality: null;

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

  @ApiProperty({ type: [ReviewTopicDto] })
  public reviewTopics: ReviewTopicDto[];

  @ApiProperty({ type: [ContributionDto] })
  public contributions: ContributionDto[];

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    title: string,
    description: string,
    creatorId: string,
    state: ProjectStateValue,
    consensuality: null,
    contributionVisibility: ContributionVisibilityValue,
    skipManagerReview: SkipManagerReviewValue,
    roles: RoleDto[],
    peerReviews: PeerReviewDto[] | null,
    reviewTopics: ReviewTopicDto[],
    contributions: ContributionDto[],
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
    this.reviewTopics = reviewTopics;
    this.contributions = contributions;
  }
}
