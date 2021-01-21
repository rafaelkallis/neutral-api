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
import { PeerReviewVisibilityLabel } from 'project/domain/project/value-objects/PeerReviewVisibility';
import { MilestoneDto } from './MilestoneDto';
import { RoleMetricDto } from './RoleMetricDto';

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
    enum: PeerReviewVisibilityLabel,
    example: PeerReviewVisibilityLabel.MANAGER,
  })
  @IsEnum(PeerReviewVisibilityLabel)
  public peerReviewVisibility: PeerReviewVisibilityLabel;

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

  @ApiProperty({ type: [MilestoneDto] })
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  public milestones: MilestoneDto[];

  @ApiProperty({ type: [ContributionDto] })
  @ValidateNested({ each: true })
  @Type(() => ContributionDto)
  public contributions: ContributionDto[];

  @ApiProperty({ type: [RoleMetricDto] })
  @ValidateNested({ each: true })
  @Type(() => RoleMetricDto)
  public roleMetrics: RoleMetricDto[];

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
    peerReviewVisibility: PeerReviewVisibilityLabel,
    skipManagerReview: SkipManagerReviewValue,
    roles: RoleDto[],
    peerReviews: PeerReviewDto[] | null,
    reviewTopics: ReviewTopicDto[],
    milestones: MilestoneDto[],
    contributions: ContributionDto[],
    roleMetrics: RoleMetricDto[],
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
    this.milestones = milestones;
    this.contributions = contributions;
    this.roleMetrics = roleMetrics;
  }
}
