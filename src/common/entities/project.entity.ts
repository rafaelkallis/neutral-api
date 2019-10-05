import { IsString, IsEnum, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

export enum ProjectState {
  FORMATION = 'formation',
  PEER_REVIEW = 'peer-review',
  FINISHED = 'finished',
}

export interface RelativeContributions {
  [roleId: string]: number;
}

interface ProjectEntityOptions {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  state: ProjectState;
  relativeContributions: RelativeContributions | null;
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
  @MaxLength(20)
  public ownerId!: string;

  @Column({ name: 'state' })
  @IsEnum(ProjectState)
  @MaxLength(255)
  public state!: ProjectState;

  @Column({ name: 'relative_contributions', type: 'jsonb', nullable: true })
  public relativeContributions!: RelativeContributions | null;

  public static from(options: ProjectEntityOptions): ProjectEntity {
    return Object.assign(new ProjectEntity(), options);
  }

  public update(options: Partial<ProjectEntityOptions>): this {
    return Object.assign(this, options);
  }
}
