import {
  IsString,
  IsNumber,
  IsEnum,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Column, Entity } from 'typeorm';
import { IsContributions } from '../validation/is-contributions';

import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

export enum ProjectState {
  FORMATION = 'formation',
  PEER_REVIEW = 'peer-review',
  FINISHED = 'finished',
}

export interface Contributions {
  [roleId: string]: number;
}

interface ProjectEntityOptions {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  state: ProjectState;
  contributions: Contributions | null;
  consensuality: number | null;
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

  @Column({ name: 'contributions', type: 'jsonb', nullable: true })
  @IsOptional()
  @IsContributions()
  public contributions!: Contributions | null;

  @Column({ name: 'consensuality', type: 'real', nullable: true })
  @IsNumber()
  @IsOptional()
  public consensuality!: number | null;

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

  public isFinishedState(): boolean {
    return this.state === ProjectState.FINISHED;
  }
}
