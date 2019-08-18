import { ApiModelProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { IsPeerReviews } from '../validation/is-peer-reviews';

import { BaseEntity } from './base.entity';

interface RoleProps {
  id: string;
  projectId: string;
  assigneeId?: string | null;
  title: string;
  description: string;
  peerReviews?: Record<string, number> | null;
}

/**
 * Role Entity
 */
@Entity('roles')
export class Role extends BaseEntity implements RoleProps {
  @Column({ name: 'project_id' })
  @IsString()
  @MaxLength(20)
  @ApiModelProperty()
  public projectId!: string;

  @Column({ name: 'assignee_id', type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiModelProperty({ required: false })
  public assigneeId?: string | null;

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

  @Column({ name: 'peer_reviews', type: 'jsonb', nullable: true })
  @IsOptional()
  @IsPeerReviews()
  @Exclude()
  public peerReviews?: Record<string, number> | null;

  public update(props: Partial<RoleProps>): this {
    return Object.assign(this, props);
  }

  protected constructor() {
    super();
  }

  public static from(props: RoleProps): Role {
    return new Role().update(props);
  }
}
