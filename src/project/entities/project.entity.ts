import {
  IsString,
  IsNumber,
  IsEnum,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { AbstractEntity } from 'common';
import { UserEntity } from 'user';
import {
  Project,
  ProjectState,
  ContributionVisibility,
  SkipManagerReview,
} from 'project/project';
import { ProjectRepository } from 'project/repositories/project.repository';

/**
 * Project Entity
 */
@Entity('projects')
export class ProjectEntity extends AbstractEntity implements Project {
  @Column({ name: 'title' })
  @IsString()
  @MaxLength(100)
  public title: string;

  @Column({ name: 'description' })
  @IsString()
  @MaxLength(1024)
  public description: string;

  @Column({ name: 'owner_id' })
  @IsString()
  @MaxLength(24)
  public ownerId: string;

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
    ownerId: string,
    state: ProjectState,
    consensuality: number | null,
    contributionVisibility: ContributionVisibility,
    skipManagerReview: SkipManagerReview,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.ownerId = ownerId;
    this.state = state;
    this.consensuality = consensuality;
    this.contributionVisibility = contributionVisibility;
    this.skipManagerReview = skipManagerReview;
  }

  /**
   *
   */
  public static fromProject(project: Project): ProjectEntity {
    const createdAt = Date.now();
    const updatedAt = Date.now();
    return new ProjectEntity(
      project.id,
      createdAt,
      updatedAt,
      project.title,
      project.description,
      project.ownerId,
      project.state,
      project.consensuality,
      project.contributionVisibility,
      project.skipManagerReview,
    );
  }

  public isOwner(user: UserEntity): boolean {
    return this.ownerId === user.id;
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
