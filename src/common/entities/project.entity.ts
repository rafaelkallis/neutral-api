import {
  IsString,
  IsNumber,
  IsEnum,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

export enum ContributionVisibility {
  ALL = 'all',
  SELF = 'self',
  NONE = 'none',
}

export enum ProjectState {
  FORMATION = 'formation',
  PEER_REVIEW = 'peer-review',
  MANAGER_REVIEW = 'manager-review',
  FINISHED = 'finished',
}

interface ProjectEntityOptions {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  state: ProjectState;
  consensuality: number | null;
  contributionVisibility: ContributionVisibility;
}

/**
 * Project Entity
 */
@Entity('projects')
export class ProjectEntity extends BaseEntity implements ProjectEntityOptions {
  @Column({ name: 'title' })
  @IsString()
  @MaxLength(100)
  public title!: string;

  @Column({ name: 'description' })
  @IsString()
  @MaxLength(1024)
  public description!: string;

  @Column({ name: 'owner_id' })
  @IsString()
  @MaxLength(24)
  public ownerId!: string;

  @Column({ name: 'state' })
  @IsEnum(ProjectState)
  @MaxLength(255)
  public state!: ProjectState;

  @Column({ name: 'consensuality', type: 'real', nullable: true })
  @IsNumber()
  @IsOptional()
  public consensuality!: number | null;

  @Column({ name: 'contribution_visibility' })
  @IsEnum(ContributionVisibility)
  @MaxLength(255)
  public contributionVisibility!: ContributionVisibility;

  public static from(options: ProjectEntityOptions): ProjectEntity {
    return Object.assign(new ProjectEntity(), options);
  }

  public update(options: Partial<ProjectEntityOptions>): this {
    return Object.assign(this, options);
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
