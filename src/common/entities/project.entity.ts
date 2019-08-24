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

interface ProjectProps {
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
export class Project extends BaseEntity implements ProjectProps {
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

  public static from(props: ProjectProps): Project {
    return Object.assign(new Project(), props);
  }

  public update(props: Partial<ProjectProps>): Project {
    return Object.assign(this, props);
  }
}
