import {
  IsString,
  IsNumber,
  IsEnum,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { AbstractModel } from 'common';
import { UserModel } from 'user';
import {
  Project,
  ProjectState,
  ContributionVisibility,
  SkipManagerReview,
} from 'project/project';

/**
 * Project Entity
 */
@Entity('projects')
export class ProjectModel extends AbstractModel {
  @Column({ name: 'title' })
  @IsString()
  @MaxLength(100)
  public title: string;

  @Column({ name: 'description' })
  @IsString()
  @MaxLength(1024)
  public description: string;

  @Column({ name: 'creator_id' })
  @IsString()
  @MaxLength(24)
  public creatorId: string;

  @Column({ name: 'state', type: 'enum', enum: ProjectState })
  @IsEnum(ProjectState)
  @MaxLength(255)
  public state: ProjectState;

  @Column({ name: 'consensuality', type: 'real', nullable: true })
  @IsNumber()
  @IsOptional()
  public consensuality: number | null;

  @Column({
    name: 'contribution_visibility',
    type: 'enum',
    enum: ContributionVisibility,
  })
  @IsEnum(ContributionVisibility)
  @MaxLength(255)
  public contributionVisibility: ContributionVisibility;

  @Column({
    name: 'skip_manager_review',
    type: 'enum',
    enum: SkipManagerReview,
  })
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

  /**
   *
   */
  public static fromProject(project: Project): ProjectModel {
    const createdAt = Date.now();
    const updatedAt = Date.now();
    return new ProjectModel(
      project.id,
      createdAt,
      updatedAt,
      project.title,
      project.description,
      project.creatorId,
      project.state,
      project.consensuality,
      project.contributionVisibility,
      project.skipManagerReview,
    );
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
