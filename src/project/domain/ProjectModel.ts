import {
  IsString,
  IsNumber,
  IsEnum,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { AbstractModel, IsIdentifier } from 'common';
import { UserModel } from 'user';

export enum ProjectState {
  FORMATION = 'formation',
  PEER_REVIEW = 'peer-review',
  MANAGER_REVIEW = 'manager-review',
  FINISHED = 'finished',
}

export enum ContributionVisibility {
  PUBLIC = 'public',
  PROJECT = 'project',
  SELF = 'self',
  NONE = 'none',
}

export enum SkipManagerReview {
  YES = 'yes',
  IF_CONSENSUAL = 'if-consensual',
  NO = 'no',
}

/**
 * Project Model
 */
export class ProjectModel extends AbstractModel {
  @IsString()
  @MaxLength(100)
  public title: string;

  @IsString()
  @MaxLength(1024)
  public description: string;

  @IsIdentifier()
  public creatorId: string;

  @IsEnum(ProjectState)
  @MaxLength(255)
  public state: ProjectState;

  @IsNumber()
  @IsOptional()
  public consensuality: number | null;

  @IsEnum(ContributionVisibility)
  @MaxLength(255)
  public contributionVisibility: ContributionVisibility;

  @IsEnum(SkipManagerReview)
  @MaxLength(255)
  public skipManagerReview: SkipManagerReview;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    title: string,
    description: string,
    creatorId: string,
    state: ProjectState,
    consensuality: number | null,
    contributionVisibility: ContributionVisibility,
    skipManagerReview: SkipManagerReview,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.creatorId = creatorId;
    this.state = state;
    this.consensuality = consensuality;
    this.contributionVisibility = contributionVisibility;
    this.skipManagerReview = skipManagerReview;
  }

  public isCreator(user: UserModel): boolean {
    return this.creatorId === user.id;
  }

  public isFormationState(): boolean {
    return this.state === ProjectState.FORMATION;
  }

  public isPeerReviewState(): boolean {
    return this.state === ProjectState.PEER_REVIEW;
  }

  public isManagerReviewState(): boolean {
    return this.state === ProjectState.MANAGER_REVIEW;
  }

  public isFinishedState(): boolean {
    return this.state === ProjectState.FINISHED;
  }
}
