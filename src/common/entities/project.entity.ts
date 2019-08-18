import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsEnum, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

export enum ProjectState {
  FORMATION = 'formation',
  PEER_REVIEW = 'peer-review',
  FINISHED = 'finished',
}

export interface ProjectOptions {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  state: ProjectState;
}

/**
 * Project Entity
 */
@Entity('projects')
export class Project extends BaseEntity {
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

  public static from({
    id,
    title,
    description,
    ownerId,
    state,
  }: ProjectOptions): Project {
    const project = new Project();
    project.id = id;
    project.title = title;
    project.description = description;
    project.ownerId = ownerId;
    project.state = state;
    return project;
  }
}
