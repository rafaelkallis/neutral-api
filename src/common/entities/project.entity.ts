import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsEnum, MaxLength } from 'class-validator';
import { Expose, Exclude, TransformClassToPlain } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { User } from './user.entity';

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
@Exclude()
export class Project extends BaseEntity implements ProjectProps {
  @Column({ name: 'title' })
  @IsString()
  @MaxLength(100)
  @Expose()
  @ApiModelProperty()
  public title!: string;

  @Column({ name: 'description' })
  @IsString()
  @MaxLength(1024)
  @Expose()
  @ApiModelProperty()
  public description!: string;

  @Column({ name: 'owner_id' })
  @IsString()
  @MaxLength(20)
  @Expose()
  @ApiModelProperty()
  public ownerId!: string;

  @Column({ name: 'state' })
  @IsEnum(ProjectState)
  @MaxLength(255)
  @Expose()
  @ApiModelProperty()
  public state!: ProjectState;

  @Column({ name: 'relative_contributions', type: 'jsonb', nullable: true })
  @Expose({ groups: ['owner'] })
  public relativeContributions?: Record<string, number> | null;

  public toPlain(user: User): Project {
    if (this.ownerId === user.id) {
      return this.toPlainForOwner();
    }
    return this;
  }

  @TransformClassToPlain({ groups: ['owner'] })
  private toPlainForOwner(): Project {
    return this;
  }

  public update(props: Partial<ProjectProps>): Project {
    return Object.assign(this, props);
  }

  public static from(props: ProjectProps): Project {
    return Object.assign(new Project(), props);
  }

  protected constructor() {
    super();
  }
}
