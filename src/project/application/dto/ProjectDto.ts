import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'shared/application/dto/BaseDto';
import { RoleDto } from 'project/application/dto/RoleDto';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectStateValue } from 'project/domain/value-objects/ProjectState';
import { ContributionVisibilityValue } from 'project/domain/value-objects/ContributionVisibility';
import { PeerReviewDto } from 'project/application/dto/PeerReviewDto';

/**
 * Project DTO
 */
export class ProjectDto extends BaseDto {
  @ApiProperty({
    example: 'Mars Shuttle',
    description: 'Title of the project',
  })
  public title: string;

  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the project',
  })
  public description: string;

  @ApiProperty()
  public creatorId: string;

  @ApiProperty({ example: ProjectStateValue.FORMATION })
  public state: ProjectStateValue;

  @ApiProperty()
  public consensuality: number | null;

  @ApiProperty({ example: ContributionVisibilityValue.SELF })
  public contributionVisibility: ContributionVisibilityValue;

  @ApiProperty({ example: SkipManagerReview.IF_CONSENSUAL.value })
  public skipManagerReview: string;

  @ApiProperty({ required: false })
  public roles: RoleDto[] | null;

  @ApiProperty({ required: false })
  public peerReviews: PeerReviewDto[] | null;

  public constructor(
    id: string,
    title: string,
    description: string,
    creatorId: string,
    state: ProjectStateValue,
    consensuality: number | null,
    contributionVisibility: ContributionVisibilityValue,
    skipManagerReview: string,
    roles: RoleDto[] | null,
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
