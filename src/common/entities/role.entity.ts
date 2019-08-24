import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { IsPeerReviews } from '../validation/is-peer-reviews';

import { BaseEntity } from './base.entity';

export interface PeerReviews {
  [roleId: string]: number;
}

interface RoleProps {
  id: string;
  projectId: string;
  assigneeId: string | null;
  title: string;
  description: string;
  peerReviews: PeerReviews | null;
}

/**
 * Role Entity
 */
@Entity('roles')
export class Role extends BaseEntity implements RoleProps {
  @Column({ name: 'project_id' })
  @IsString()
  @MaxLength(20)
  public projectId!: string;

  @Column({ name: 'assignee_id', type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  public assigneeId!: string | null;

  @Column({ name: 'title' })
  @IsString()
  @MaxLength(100)
  public title!: string;

  @Column({ name: 'description' })
  @IsString()
  @MaxLength(1024)
  public description!: string;

  @Column({ name: 'peer_reviews', type: 'jsonb', nullable: true })
  @IsOptional()
  @IsPeerReviews()
  public peerReviews!: PeerReviews | null;

  public static from(props: RoleProps): Role {
    return new Role().update(props);
  }

  public update(props: Partial<RoleProps>): this {
    return Object.assign(this, props);
  }
}
