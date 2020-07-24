import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';
import { RoleDto } from 'project/application/dto/RoleDto';
import { SkipManagerReviewValue } from 'project/domain/project/value-objects/SkipManagerReview';
import { ProjectStateValue } from 'project/domain/project/value-objects/states/ProjectStateValue';
import { ContributionVisibilityValue } from 'project/domain/project/value-objects/ContributionVisibility';
import { PeerReviewDto } from 'project/application/dto/PeerReviewDto';
import { ReviewTopicDto } from './ReviewTopicDto';
import { ContributionDto } from './ContributionDto';
import {
  IsString,
  MaxLength,
  IsEnum,
  ValidateNested,
  IsOptional,
  IsObject,
} from 'class-validator';
import { IsIdentifier } from 'shared/validation/IsIdentifier';
import { Type } from 'class-transformer';
import { PeerReviewVisibilityValue } from 'project/domain/project/value-objects/PeerReviewVisibility';

/**
 * Project DTO
 */
export class ProjectDto extends ModelDto {
  @ApiProperty({
    example: 'Mars Shuttle',
    description: 'Title of the project',
  })
  @IsString()
  @MaxLength(100)
  public title: string;

  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui.',
    description: 'Description of the project',
  })
  @IsString()
  @MaxLength(1024)
  public description: string;

  @ApiProperty({
    type: Object,
    example: { custom1: 'foo', custom2: {} },
    description: 'Additional project metadata',
  })
  @IsObject()
  public meta: Record<string, unknown>;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsIdentifier()
  public creatorId: string;

  @ApiProperty({
    enum: ProjectStateValue,
    example: ProjectStateValue.FORMATION,
  })
  @IsEnum(ProjectStateValue)
  public state: ProjectStateValue;

  @ApiProperty({
    enum: ContributionVisibilityValue,
    example: ContributionVisibilityValue.SELF,
  })
  @IsEnum(ContributionVisibilityValue)
  public contributionVisibility: ContributionVisibilityValue;

  @ApiProperty({
    enum: PeerReviewVisibilityValue,
    example: PeerReviewVisibilityValue.MANAGER,
  })
  @IsEnum(PeerReviewVisibilityValue)
  public peerReviewVisibility: PeerReviewVisibilityValue;

  @ApiProperty({
    enum: SkipManagerReviewValue,
    example: SkipManagerReviewValue.IF_CONSENSUAL,
  })
  @IsEnum(SkipManagerReviewValue)
  public skipManagerReview: SkipManagerReviewValue;

  @ApiProperty({ type: [RoleDto] })
  @ValidateNested({ each: true })
  @Type(() => RoleDto)
  public roles: RoleDto[];

  @ApiProperty({ type: [PeerReviewDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PeerReviewDto)
  public peerReviews: PeerReviewDto[] | null;

  @ApiProperty({ type: [ReviewTopicDto] })
  @ValidateNested({ each: true })
  @Type(() => ReviewTopicDto)
  public reviewTopics: ReviewTopicDto[];

  @ApiProperty({ type: [ContributionDto] })
  @ValidateNested({ each: true })
  @Type(() => ContributionDto)
  public contributions: ContributionDto[];

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    title: string,
    description: string,
    meta: Record<string, unknown>,
    creatorId: string,
    state: ProjectStateValue,
    contributionVisibility: ContributionVisibilityValue,
    peerReviewVisibility: PeerReviewVisibilityValue,
    skipManagerReview: SkipManagerReviewValue,
    roles: RoleDto[],
    peerReviews: PeerReviewDto[] | null,
    reviewTopics: ReviewTopicDto[],
    contributions: ContributionDto[],
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.meta = meta;
    this.creatorId = creatorId;
    this.state = state;
    this.contributionVisibility = contributionVisibility;
    this.peerReviewVisibility = peerReviewVisibility;
    this.skipManagerReview = skipManagerReview;
    this.roles = roles;
    this.peerReviews = peerReviews;
    this.reviewTopics = reviewTopics;
    this.contributions = contributions;
  }
}
