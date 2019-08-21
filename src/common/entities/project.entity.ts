import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsEnum, MaxLength } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

export enum ProjectState {
  FORMATION = 'formation',
  PEER_REVIEW = 'peer-review',
  FINISHED = 'finished',
}

interface ProjectProps {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  state: ProjectState;
  relativeContributions?: Record<string, number> | null;
}

/**
 * Project Entity
 */
@Entity('projects')
export class Project extends BaseEntity implements ProjectProps {
  @Column({ name: 'title' })
  @IsString()
  @MaxLength(100)
  @ApiModelProperty()
  public title!: string;

  @Column({ name: 'description' })
  @IsString()
  @MaxLength(1024)
  @ApiModelProperty()
  public description!: string;

  @Column({ name: 'owner_id' })
  @IsString()
  @MaxLength(20)
  @ApiModelProperty()
  public ownerId!: string;

  @Column({ name: 'state' })
  @IsEnum(ProjectState)
  @MaxLength(255)
  @ApiModelProperty()
  public state!: ProjectState;

  @Column({ name: 'relative_contributions', type: 'jsonb', nullable: true })
  @Exclude()
  public relativeContributions?: Record<string, number> | null;

  public update(props: Partial<ProjectProps>): this {
    return Object.assign(this, props);
  }

  protected constructor() {
    super();
  }

  public static from(props: ProjectProps): Project {
    return Object.assign(new Project(), props);
  }
}
